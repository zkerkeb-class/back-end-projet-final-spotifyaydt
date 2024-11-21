import sharp from 'sharp';

export const processImage = async (inputPath) => {
  const outputPaths = {};

  try {
    const formats = ['webp', 'jpeg', 'avif'];
    for (let format of formats) {
      outputPaths[format] = `${inputPath}.${format}`;
      await sharp(inputPath).toFormat(format).toFile(outputPaths[format]);
    }

    const sizes = ['thumbnail', 'medium', 'large'];
    const dimensions = {
      thumbnail: { width: 100, height: 100 },
      medium: { width: 500, height: 500 },
      large: { width: 1000, height: 1000 },
    };

    for (let size of sizes) {
      outputPaths[size] = `${inputPath}_${size}.jpg`;
      await sharp(inputPath)
        .resize(dimensions[size].width, dimensions[size].height)
        .toFile(outputPaths[size]);
    }

    return outputPaths;
  } catch (error) {
    throw new Error(`Erreur lors du traitement de l'image: ${error.message}`);
  }
};
