
import  Video from '../Models/videoModels.js';
import  cloudinary from "../Config/cloudinary.js";
import runFFmpegProcess from '../utils/ffmpeg.js'
import  fs from 'fs';
import  path from 'path';
import  os from 'os';
import https from "https"

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

// Process and save annotated video
export const annotateVideo = async (req, res) => {
  try {
    const { id, annotations, title, originalUrl } = req.body;
   
    if (!id || !annotations || !annotations.length) {
      return res.status(400).json({ message: 'Video ID and annotations are required' });
    }
   
    // Get the video from database
    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
   
    // Create temp directory for processing
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'annotation-'));
    const tempVideoPath = path.join(tempDir, 'original.mp4');
    const outputPath = path.join(tempDir, 'annotated.mp4');
   
    console.log(`Processing video: ${id}`);
    console.log(`Original URL: ${originalUrl}`);
    console.log(`Temp video path: ${tempVideoPath}`);
    
    try {
      // Download video directly using the URL
      await downloadFromCloudinary(originalUrl, tempVideoPath);
      
      // Verify the file was downloaded successfully
      if (!fs.existsSync(tempVideoPath) || fs.statSync(tempVideoPath).size === 0) {
        throw new Error('Downloaded file is empty or does not exist');
      }
      
      // Create FFmpeg filter commands for each annotation
      // Escape special characters in the text to prevent FFmpeg errors
      let filterCommands = annotations.map(anno => {
        const escapedText = anno.text.replace(/[\\':]/g, '\\$&');
        return `drawtext=text='${escapedText}':x=${anno.x}:y=${anno.y}:fontsize=24:fontcolor=white:borderw=2:bordercolor=black:enable='between(t,${anno.startTime},${anno.endTime})'`;
      }).join(',');
      
      // Process video with FFmpeg
      await runFFmpegProcess(tempVideoPath, outputPath, filterCommands);
      
      // Check if the output file was created successfully
      if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
        throw new Error('FFmpeg output file is empty or does not exist');
      }
      
      // Upload processed video to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(outputPath, {
        resource_type: 'video',
        folder: 'annotated_videos',
        public_id: `annotated_${video._id}_${Date.now()}`
      });
      
      // Create a new annotated video record or update existing one
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
      
      // Clean up temp files
      fs.rmSync(tempDir, { recursive: true, force: true });
      
      res.json({
        success: true,
        video: annotatedVideo
      });
    } catch (error) {
      // Clean up temp directory in case of error
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
      throw error;
    }
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