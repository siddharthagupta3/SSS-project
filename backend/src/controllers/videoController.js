const Video = require('../models/Video');
const { uploadVideoToCloudinary } = require('../middleware/uploadMiddleware');

const getVideos = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), 50);
    const search = String(req.query.search || '').trim();
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const [total, videos] = await Promise.all([
      Video.countDocuments(filter),
      Video.find(filter)
        .select('title description tags videoUrl thumbnailUrl duration relatedProduct createdAt')
        .populate('relatedProduct', 'title images price discountPrice')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    res.set('Cache-Control', 'no-store');
    res.status(200).json({
      success: true,
      data: { videos, page, pages: Math.ceil(total / limit) || 1, total },
    });
  } catch (error) {
    next(error);
  }
};

const getAdminVideos = async (req, res, next) => {
  try {
    const videos = await Video.find({})
      .select('title description tags videoUrl thumbnailUrl duration relatedProduct createdAt')
      .populate('relatedProduct', 'title')
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, data: videos });
  } catch (error) {
    next(error);
  }
};

const createVideo = async (req, res, next) => {
  try {
    const { title, description = '', tags = [], youtubeUrl = '', thumbnailUrl = '', relatedProduct = null, duration = 0 } = req.body;
    if (!title || !String(title).trim()) {
      res.status(400);
      throw new Error('Video title is required');
    }

    let videoUrl = String(youtubeUrl || '').trim();
    let finalThumbnail = String(thumbnailUrl || '').trim();
    let uploadedDuration = Number(duration) || 0;

    if (req.file) {
      const upload = await uploadVideoToCloudinary(req.file);
      videoUrl = upload.secure_url;
      uploadedDuration = Number(upload.duration) || uploadedDuration;
      if (!finalThumbnail) finalThumbnail = upload.secure_url.replace(/\.[^.]+$/, '.jpg');
    }

    if (!videoUrl) {
      res.status(400);
      throw new Error('Upload a video or provide a YouTube link');
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : String(tags).split(',').map((tag) => tag.trim()).filter(Boolean);

    const video = await Video.create({
      title: title.trim(),
      description: description.trim(),
      tags: parsedTags,
      videoUrl,
      thumbnailUrl: finalThumbnail,
      duration: uploadedDuration,
      relatedProduct: relatedProduct || null,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: video });
  } catch (error) {
    next(error);
  }
};

const updateVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      res.status(404);
      throw new Error('Video not found');
    }
    if (typeof req.body.title === 'string') video.title = req.body.title.trim();
    if (typeof req.body.description === 'string') video.description = req.body.description.trim();
    if (req.body.tags !== undefined) {
      video.tags = Array.isArray(req.body.tags)
        ? req.body.tags
        : String(req.body.tags).split(',').map((tag) => tag.trim()).filter(Boolean);
    }
    if (typeof req.body.youtubeUrl === 'string' && req.body.youtubeUrl.trim()) video.videoUrl = req.body.youtubeUrl.trim();
    if (typeof req.body.thumbnailUrl === 'string') video.thumbnailUrl = req.body.thumbnailUrl.trim();
    if (req.body.relatedProduct !== undefined) video.relatedProduct = req.body.relatedProduct || null;
    await video.save();
    res.status(200).json({ success: true, data: video });
  } catch (error) {
    next(error);
  }
};

const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findByIdAndDelete(req.params.id);
    if (!video) {
      res.status(404);
      throw new Error('Video not found');
    }
    res.status(200).json({ success: true, message: 'Video deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getVideos, getAdminVideos, createVideo, updateVideo, deleteVideo };
