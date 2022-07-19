import express from "express";
import { getUser, getUsers, Register, Login, Logout, updateUser, uploadImage, deleteUser } from "../controllers/Users.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";
 
const router = express.Router();
 
router.post('/', Register);
router.post('/login', Login);
router.get('/id/:id', verifyToken, getUser);
router.get('/', verifyToken, getUsers);
router.get('/token', refreshToken);
router.put('/:id', uploadImage, updateUser);
router.delete('/logout', Logout);
router.delete('/:id', verifyToken, deleteUser);
 
export default router;