const axios = require("axios");
require("dotenv").config();

class UnsplashController {
  static async getRandomPhotos(req, res) {
    try {
      const response = await axios.get(
        "https://api.unsplash.com/photos/random?orientation=landscape&count=12",
        {
          headers: {
            Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      const photos = response.data.map((photo, index) => ({
        no: index + 1,
        id: photo.id,
        username: photo.user.name,
        user_profile: photo.user.links.html,
        alt_description: photo.alt_description,
        urls: photo.urls,
      }));

      res.status(200).json({
        status: "success",
        message: "Random photos fetched successfully",
        data: photos,
        // data: response.data,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Failed to fetch random photos" });
    }
  }

  static async searchPhotos(req, res) {
    const { query, page = 1, per_page = 12 } = req.query;

    try {
      const response = await axios.get(
        `https://api.unsplash.com/search/photos?query=${query}&page=${page}&per_page=${per_page}`,
        {
          headers: {
            Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      let no = (page - 1) * per_page + 1;
      const photos = response.data.results.map((photo) => ({
        no: no++,
        id: photo.id,
        username: photo.user.name,
        user_profile: photo.user.links.html,
        alt_description: photo.alt_description,
        urls: photo.urls,
      }));

      const totalPages = Math.ceil(response.data.total / per_page); // Hitung total halaman berdasarkan total foto yang tersedia

      res.status(200).json({
        status: "success",
        message: "Photos fetched successfully with query " + query,
        totalPages,
        data: photos,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Failed to search photos" });
    }
  }
}

module.exports = UnsplashController;
