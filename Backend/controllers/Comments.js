import Comments from "../models/CommentModel.js"
import Users from "../models/UserModel.js";

export const getComByUser = async (req, res) => {
    try {
        const comments = await Comments.findAll({
            where: { id: req.params.id }
        });
        res.json(comments);
    } catch (error) {
        res.json({ msg: error.msg });
    }
}



export const publishComment = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    try {
        const user = await Users.findAll({
            where: { refresh_token: refreshToken }
        });
        const userId = user[0].id;
        const comments = {
            ...req.body,
            userId: userId,
            PostId: req.body.hiddenField
        };
        await Comments.create(comments);
        res.json({ comments });
    } catch (error) {
        res.json({ msg: error.msg });
    }
}

export const deleteComment = async (req, res) => {
    try {
        const comId = req.params.id;
        await Comments.destroy({
            where: {
                id: comId
            }
        });
        res.json({ msg: "Publication supprimée" });
    } catch (error) {
        res.json({ msg: error.msg });
    }
}
