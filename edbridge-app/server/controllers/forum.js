const ForumPost = require('../models/Forum');
const User = require('../models/User');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all forum posts
// @route   GET /api/forum
// @access  Private
exports.getPosts = asyncHandler(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  
  // Filter
  let query = {};
  
  // Category filter
  if (req.query.category) {
    query.category = req.query.category;
  }
  
  // Search
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }
  
  // Tag filter
  if (req.query.tag) {
    query.tags = req.query.tag;
  }
  
  // Execute query
  const total = await ForumPost.countDocuments(query);
  const posts = await ForumPost.find(query)
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);
  
  // Pagination result
  const pagination = {};
  
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }
  
  res.status(200).json({
    success: true,
    count: posts.length,
    pagination,
    data: posts
  });
});

// @desc    Get single forum post
// @route   GET /api/forum/:id
// @access  Private
exports.getPost = asyncHandler(async (req, res, next) => {
  const post = await ForumPost.findById(req.params.id);
  
  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }
  
  // Increment view count
  post.views += 1;
  await post.save();
  
  res.status(200).json({
    success: true,
    data: post
  });
});

// @desc    Create new forum post
// @route   POST /api/forum
// @access  Private
exports.createPost = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;
  req.body.userName = req.user.name;
  
  // Create post
  const post = await ForumPost.create(req.body);
  
  // Update user's comment count
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { commentCount: 1 }
  });
  
  res.status(201).json({
    success: true,
    data: post
  });
});

// @desc    Update forum post
// @route   PUT /api/forum/:id
// @access  Private
exports.updatePost = asyncHandler(async (req, res, next) => {
  let post = await ForumPost.findById(req.params.id);
  
  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user owns the post
  if (post.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to update this post`, 401));
  }
  
  // Update timestamp
  req.body.updatedAt = Date.now();
  
  post = await ForumPost.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: post
  });
});

// @desc    Delete forum post
// @route   DELETE /api/forum/:id
// @access  Private
exports.deletePost = asyncHandler(async (req, res, next) => {
  const post = await ForumPost.findById(req.params.id);
  
  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }
  
  // Make sure user owns the post
  if (post.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to delete this post`, 401));
  }
  
  await ForumPost.findByIdAndDelete(req.params.id);
  
  // Update user's comment count
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { commentCount: -1 }
  });
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Add comment to forum post
// @route   POST /api/forum/:id/comments
// @access  Private
exports.addComment = asyncHandler(async (req, res, next) => {
  const post = await ForumPost.findById(req.params.id);
  
  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }
  
  // Create comment
  const comment = {
    content: req.body.content,
    user: req.user.id,
    userName: req.user.name
  };
  
  // Add comment to post
  post.comments.push(comment);
  await post.save();
  
  // Update user's comment count
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { commentCount: 1 }
  });
  
  res.status(201).json({
    success: true,
    data: post
  });
});

// @desc    Delete comment from forum post
// @route   DELETE /api/forum/:id/comments/:commentId
// @access  Private
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const post = await ForumPost.findById(req.params.id);
  
  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }
  
  // Find comment
  const comment = post.comments.id(req.params.commentId);
  
  if (!comment) {
    return next(new ErrorResponse(`Comment not found with id of ${req.params.commentId}`, 404));
  }
  
  // Make sure user owns the comment
  if (comment.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`User not authorized to delete this comment`, 401));
  }
  
  // Remove comment
  comment.remove();
  await post.save();
  
  // Update user's comment count
  await User.findByIdAndUpdate(req.user.id, {
    $inc: { commentCount: -1 }
  });
  
  res.status(200).json({
    success: true,
    data: post
  });
});

// @desc    Like forum post
// @route   PUT /api/forum/:id/like
// @access  Private
exports.likePost = asyncHandler(async (req, res, next) => {
  const post = await ForumPost.findById(req.params.id);
  
  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }
  
  // Increment like count
  post.likes += 1;
  await post.save();
  
  res.status(200).json({
    success: true,
    data: post
  });
});
