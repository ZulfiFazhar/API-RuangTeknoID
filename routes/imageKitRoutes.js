const express = require("express");
const ImagekitController = require("../controllers/imagekitController");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.post("/upload", upload.single("image"), ImagekitController.uploadImage);
router.delete("/delete/:fileId", ImagekitController.deleteImage);

module.exports = router;
