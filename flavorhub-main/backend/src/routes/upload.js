const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { auth, adminOnly } = require('../middleware/auth');

// @route   POST /api/upload
// @desc    Upload an image
// @access  Private/Admin
router.post('/', auth, adminOnly, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: { message: 'Please upload a file' } });
    }

    // Construct URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    res.json({
        url: imageUrl,
        filename: req.file.filename
    });
});

module.exports = router;
