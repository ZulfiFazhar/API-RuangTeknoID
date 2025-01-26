const express = require("express");
const unsplashController = require("../controllers/UnsplashController");

const router = express.Router();

router.get("/random-photos", unsplashController.getRandomPhotos);
router.get("/search-photos", unsplashController.searchPhotos);

module.exports = router;
