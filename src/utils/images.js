const path = require('path');
const uuid = require('uuid');
const { unlink, writeFile } = require('fs/promises');

const STATIC_IMAGES_FOLDER_PATH = '../../static/images/';

const getImageName = (img, folderName = '') => {
  const extension = img.originalname.split('.').pop();
  return `${folderName}/${uuid.v4()}.${extension}`;
};

module.exports = {
  saveImage(image, folderName) {
    const imageName = getImageName(image, folderName);
    writeFile(
      path.resolve(__dirname, STATIC_IMAGES_FOLDER_PATH, imageName),
      image.buffer,
    );
    return imageName;
  },
  deleteImage(imageName) {
    return unlink(
      path.resolve(__dirname, STATIC_IMAGES_FOLDER_PATH, imageName),
    );
  },
};
