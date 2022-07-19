import Posts from "../models/PostModel.js";
import Users from "../models/UserModel.js";
import Comments from "../models/CommentModel.js";
import multer from "multer";
import path from "path";
import fse from "fs-extra";


export const getAPost = async (req, res) => {
    try {
        const posts = await Posts.findAll({
            include: [{ model: Users }],
            where: { id: req.params.id }
        });
        res.json(posts);
    } catch (error) {
        res.json({ msg: error.msg });
    }
}

export const getMyPosts = async (req, res) => {
    try {
        const posts = await Posts.findAll({
            include: [{ model: Users }, { model: Comments }],
            where: { userId: req.params.id }
        });
        res.json(posts);
    } catch (error) {
        res.json({ msg: error.msg });
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Posts.findAll({
            include: [{ model: Users }, { model: Comments }],
            order: [['createdAt', 'desc']]
        });
        res.json(posts);
    } catch (error) {
        res.json({ msg: error.msg });
    }
}

export const publishPost = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    console.log(req.file)
    try {
        const user = await Users.findAll({
            where: { refresh_token: refreshToken }
        });
        const userId = user[0].id;

        const post = req.file ?
            {
                ...req.body,
                userId: userId,
                postImg: req.file.filename
            } : {
                ...req.body,
                userId: userId,
            };
        await Posts.create(post);
        res.json({ msg: "Publication réussie" });
    } catch (error) {
        res.json({ msg: error.msg });
    }
}

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const Post = await Posts.findOne({ where: { id: postId } });
        let postimgname = Post.postImg;
        fse.unlink(`../frontend/public/images/postpictures/${postimgname}`);
        await Posts.destroy({
            where: {
                id: postId
            }
        });
        res.json({ msg: "Publication supprimée" });
    } catch (error) {
        res.json({ msg: error.msg });
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../frontend/public/images/postpictures')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname + '-' + Date.now() + path.extname(file.originalname))
    }
})

export const uploadImage = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/
        const mimeType = fileTypes.test(file.mimetype)
        const extname = fileTypes.test(path.extname(file.originalname))

        if (mimeType && extname) {
            return cb(null, true)
        }
        cb('Give proper files formate to upload')
    }
}).single('postImg')


