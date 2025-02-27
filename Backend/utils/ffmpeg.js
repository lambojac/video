import ffmpeg from 'fluent-ffmpeg';
const runFFmpegProcess = (inputPath, outputPath, filterCommands) => {
    return new Promise((resolve, reject) => {
      // Construct the FFmpeg command with filter_complex
      let ffmpegCommand;
      
      if (filterCommands) {
        ffmpegCommand = ffmpeg(inputPath)
          .videoFilters(filterCommands.split(','))
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