const express = require('express');
const multer = require('multer');
const router = express.Router();

const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');
const { adminLimiter } = require('../middleware/rateLimiter');
const { getVideos, getAdminVideos, createVideo, updateVideo, deleteVideo } = require('../controllers/videoController');

const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['video/mp4', 'video/webm'].includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only MP4 and WebM videos are allowed'), false);
  },
});

router.get('/', getVideos);
router.get('/admin/all', verifyToken, requireAdmin, adminLimiter, getAdminVideos);
router.post('/', verifyToken, requireAdmin, adminLimiter, videoUpload.single('video'), createVideo);
router.put('/:id', verifyToken, requireAdmin, adminLimiter, updateVideo);
router.delete('/:id', verifyToken, requireAdmin, adminLimiter, deleteVideo);

module.exports = router;
