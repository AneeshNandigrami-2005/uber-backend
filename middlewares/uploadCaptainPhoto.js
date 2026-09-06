const multer = require("multer");

// Vercel functions have an ephemeral, read-only filesystem.
// Keep uploads in memory until Cloudinary stores them permanently.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});

module.exports = upload;