const express = require('express');
const router = express.Router();
const { 
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  addComment,
  deleteComment,
  likePost
} = require('../controllers/forum');
const { protect } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getPosts)
  .post(protect, createPost);

router
  .route('/:id')
  .get(protect, getPost)
  .put(protect, updatePost)
  .delete(protect, deletePost);

router
  .route('/:id/comments')
  .post(protect, addComment);

router
  .route('/:id/comments/:commentId')
  .delete(protect, deleteComment);

router
  .route('/:id/like')
  .put(protect, likePost);

module.exports = router;
