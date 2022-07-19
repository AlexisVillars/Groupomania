import express from "express";
import { getAPost, getMyPosts, getAllPosts, uploadImage, publishPost, deletePost } from "../controllers/Posts.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";

const router = express.Router();

router.post('/', uploadImage, publishPost);
router.get('/', verifyToken, getAllPosts);
router.get('/id/:id', verifyToken, getAPost);
router.get('/user/:id', verifyToken, getMyPosts);
router.get('/token', refreshToken);
router.delete('/id/:id', verifyToken, deletePost);

export default router;