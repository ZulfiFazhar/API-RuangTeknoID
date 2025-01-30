const express = require("express");
const ImagekitController = require("../controllers/imagekitController");
const multer = require("multer");
const upload = multer();

const router = express.Router();

router.post('/upload', upload.single('file'), ImagekitController.uploadImage);

module.exports = router;
