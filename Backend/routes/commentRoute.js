import express from "express";
import { getComByUser, publishComment, deleteComment } from "../controllers/Comments.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";

const router = express.Router();

router.post('/id/:id', publishComment);
router.get('/user/:id', verifyToken, getComByUser);
router.get('/token', refreshToken);
router.delete('/id/:id', verifyToken, deleteComment);

export default router;