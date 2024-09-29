const multer = require("multer");
const sharp = require("sharp");
const path = require("node:path");

const dest = "./public/images";

// Configure multer storage
const storage = multer.memoryStorage(); // Store files in memory temporarily

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only .jpg, .png, and .gif files are allowed!'), false);
    }
    cb(null, true);
  }
}).single('logo'); // Adjust the field name according to your form input

// Resize middleware
const resizeImage = async (req, res, next) => {
  if (!req.file) {
    return next(); // No file to resize, move on to the next middleware
  }

  try {
    const image = sharp(req.file.buffer);
    const metadata = await image.metadata();

    let width, height;

    // Determine the new dimensions based on the image type
    if (metadata.width === metadata.height) {
      // If square, keep it square
      width = height = Math.min(metadata.width, 192); // Resize to max 192px
    } else {
      // If rectangular, ensure the longest side is at most 192px
      if (metadata.width > metadata.height) {
        width = 192;
        height = Math.round((192 * metadata.height) / metadata.width);
      } else {
        height = 192;
        width = Math.round((192 * metadata.width) / metadata.height);
      }
    }

    // Resize the image
    const resizedBuffer = await image.resize(width, height).toBuffer();

    // Update the request file with resized image buffer
    req.file.buffer = resizedBuffer;

    // Generate a unique filename
    const filename = `IMG_${Date.now()}${path.extname(req.file.originalname)}`;
    req.file.filename = filename; // Save the filename in the request

    next(); // Proceed to the next middleware
  } catch (error) {
    console.error('Error resizing image:', error);
    return res.status(500).json({ message: 'Error resizing image' });
  }
};

// Export the upload middleware and the resize function
module.exports = {
  upload,
  resizeImage
};
