const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

// Verify configuration
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_SECRET_KEY
) {
  console.error(
    "Cloudinary configuration is missing. Please check your .env file."
  );
} else {
  console.log("Cloudinary configured successfully");
}

module.exports = cloudinary;
