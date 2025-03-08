
import  Video from '../Models/videoModels.js';
import  cloudinary from "../Config/cloudinary.js";
import runFFmpegProcess from '../utils/ffmpeg.js'
import  fs from 'fs';
import  path from 'path';
import  os from 'os';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import https from "https"
import { spawn, exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const pythonScriptPath = path.join(__dirname, 'script/video-annotator.py');

export const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const annotateVideo = async (req, res) => {
  try {
    const { id, annotations, title, originalUrl } = req.body;

    if (!id || !annotations || !annotations.length) {
      return res.status(400).json({ message: 'Video ID and annotations are required' });
    }

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'annotation-'));
    const tempVideoPath = path.join(tempDir, 'original.mp4');
    const temp2VideoPath = path.join(tempDir, 'temp2.mp4');
    const outputPath = path.join(tempDir, 'annotated.mp4');
    
    await downloadFromCloudinary(originalUrl, tempVideoPath);

    if (!fs.existsSync(tempVideoPath) || fs.statSync(tempVideoPath).size === 0) {
      throw new Error('Downloaded file is empty or does not exist');
    }

    const annotationsData = annotations.map(anno => ({
      ...anno,
      startTime: parseFloat(anno.startTime),
      endTime: parseFloat(anno.endTime)
    }));

    const pythonProcess = spawn('python3.10', [pythonScriptPath, tempVideoPath, outputPath, JSON.stringify(annotationsData)]);
    
    pythonProcess.stdout.on('data', (data) => {
      console.log(`Python stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python stderr: ${data}`);
    });

    pythonProcess.on('close', async (code) => {
      if (code !== 0) {
        return res.status(500).json({ message: 'Error occurred during video processing' });
      }

      if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
        return res.status(500).json({ message: 'Processed video file is empty or does not exist' });
      }

      const ffmpegCommand = `ffmpeg -i ${outputPath} -c:v libx264 -c:a aac -strict experimental ${temp2VideoPath}`;
      
      await new Promise((resolve, reject) => {
        exec(ffmpegCommand, (error, stdout, stderr) => {
          if (error) {
            reject(`Error processing video: ${stderr}`);
          } else {
            resolve(stdout);
          }
        });
      });

      const uploadResult = await cloudinary.uploader.upload(temp2VideoPath, {
        resource_type: 'video',
        folder: 'annotated_videos',
        public_id: `annotated_${video._id}_${Date.now()}`
      });

      const annotatedVideo = await Video.findOneAndUpdate(
        { originalVideoId: id },
        {
          title: `${title} (Annotated)`,
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          originalVideoId: id,
          annotations: annotations,
          privacy: video.privacy,
          isAnnotated: true
        },
        { new: true, upsert: true }
      );

      fs.rmSync(tempDir, { recursive: true, force: true });

      res.json({
        success: true,
        video: annotatedVideo
      });
    });

  } catch (error) {
    console.error('Error processing annotation:', error);
    res.status(500).json({ message: 'Error processing annotation', error: error.message });
  }
};

// Helper function to download from Cloudinary
const downloadFromCloudinary = async (url, destination) => {
  try {
    console.log('Downloading video from URL:', url);
    
    // Extract public ID correctly from the URL
    // Pattern: https://res.cloudinary.com/cloud_name/video/upload/v{version}/folder/public_id.ext
    const urlRegex = /\/v\d+\/(?:[\w-]+\/)?([^.]+)/;
    const match = url.match(urlRegex);
    
    if (!match || !match[1]) {
      throw new Error('Could not extract public ID from URL: ' + url);
    }
    
    const publicId = match[1];
    console.log('Extracted public ID:', publicId);
    
    // Create a write stream for the destination file
    const file = fs.createWriteStream(destination);
    
    // Use a direct HTTPS request to download the file
    return new Promise((resolve, reject) => {
      // const https = require('https');
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download video. Status code: ${response.statusCode}`));
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          file.close();
          console.log('Download completed successfully');
          resolve();
        });
        
        file.on('error', (err) => {
          fs.unlink(destination, () => {});
          reject(err);
        });
      }).on('error', (err) => {
        fs.unlink(destination, () => {});
        reject(err);
      });
    });
  } catch (error) {
    console.error('Error in downloadFromCloudinary:', error);
    throw error;
  }
};