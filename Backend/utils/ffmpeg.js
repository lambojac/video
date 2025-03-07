// import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);



const runFFmpegProcess = (inputPath, outputPath, filterCommands) => {
    return new Promise((resolve, reject) => {
      // Construct the FFmpeg command with filter_complex
      let ffmpegCommand;
      console.log("command", filterCommands);
      if (filterCommands) {
        ffmpegCommand = ffmpeg(inputPath)
          .videoFilters(filterCommands)
          .outputOptions('-c:a copy')  // Copy audio codec
          .output(outputPath)
          .on('end', () => {
            console.log('FFmpeg processing completed');
            resolve();
          })
          .on('error', (err) => {
            console.error('FFmpeg processing error:', err);
            reject(err);
          });
      } else {
        // If no filter commands, just copy the video
        ffmpegCommand = ffmpeg(inputPath)
          .output(outputPath)
          .on('end', () => {
            console.log('FFmpeg processing completed');
            resolve();
          })
          .on('error', (err) => {
            console.error('FFmpeg processing error:', err);
            reject(err);
          });
      }
      
      // Start the FFmpeg process
      ffmpegCommand.run();
    });
  };
  export default runFFmpegProcess 