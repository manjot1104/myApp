// middleware/uploadCSV.js
const multer = require("multer");

const storage = multer.memoryStorage(); // Keep file in memory for parsing
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true);
    } else {
      cb(new Error("Only CSV files are allowed"), false);
    }
  },
});

module.exports = upload;
