const multer = require("multer");
const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const imgName = Date.now();
    const extension = MIME_TYPES[file.mimetype];
    cb(null, imgName + "." + extension);
  },
});

module.exports = multer({ storage: storage }).single("image");
