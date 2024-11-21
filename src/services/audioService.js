import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

export const convertAudio = (inputPath, outputFormat) => {
  return new Promise((resolve, reject) => {
    const outputPath = path.join(
      __dirname,
      `converted_${Date.now()}.${outputFormat}`,
    );

    ffmpeg(inputPath)
      .output(outputPath)
      .on('end', () => resolve(outputPath))
      .on('error', (err) =>
        reject(new Error(`Erreur de conversion audio: ${err.message}`)),
      )
      .run();
  });
};
