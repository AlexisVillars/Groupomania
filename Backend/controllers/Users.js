import Users from "../models/UserModel.js";
import Posts from "../models/PostModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fse from "fs-extra";

export const getUser = async (req, res) => {
    try {
        const user = await Users.findByPk(req.params.id, {
            attributes: { exclude: ["password"] }
        });
        res.json(user);
    } catch (error) {
        console.log(error);
    }
}

export const getUsers = async (req, res) => {
    try {
        const users = await Users.findAll({});
        res.json(users);
    } catch (error) {
        console.log(error);
    }
}

export const Register = async (req, res) => {
    const { nom, prenom, email, password, confPassword } = req.body;
    if (password !== confPassword) return res.status(400).json({ msg: "Veuillez confirmer le mot de passe" });
    const emailExists = await Users.findOne({ where: { email: req.body.email } });
    if (!emailExists) {
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);
        try {
            await Users.create({
                nom: nom,
                prenom: prenom,
                userImg: "128x128.png",
                email: email,
                password: hashPassword
            });
            res.json({ msg: "Inscription réussie" });
        } catch (error) {
            console.log(error);
        }
    } else {
        return res.status(400).json({ msg: "Cette adresse email existe déjà" });
    }
}

export const Login = async (req, res) => {
    try {
        const user = await Users.findAll({
            where: {
                email: req.body.email
            }
        });
        const match = await bcrypt.compare(req.body.password, user[0].password);
        if (!match) return res.status(400).json({ msg: "Mot de passe erroné" });
        const userId = user[0].id;
        const nom = user[0].nom;
        const prenom = user[0].prenom;
        const userImg = user[0].userImg;
        const email = user[0].email;
        const accessToken = jwt.sign({ userId, nom, prenom, userImg, email }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '15s'
        });
        const refreshToken = jwt.sign({ userId, nom, prenom, userImg, email }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '1d'
        });
        await Users.update({ refresh_token: refreshToken }, {
            where: {
                id: userId
            }
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });
        res.json({ accessToken });
    } catch (error) {
        res.status(404).json({ msg: "L'adresse email n'existe pas" });
    }
}

export const Logout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);
    const user = await Users.findAll({
        where: {
            refresh_token: refreshToken
        }
    });
    if (!user[0]) return res.sendStatus(204);
    const userId = user[0].id;
    await Users.update({ refresh_token: null }, {
        where: {
            id: userId
        }
    });
    res.clearCookie('refreshToken');
    return res.sendStatus(200);
}

export const updateUser = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);

    try {
        const user = await Users.findAll({
            where: { refresh_token: refreshToken },
            include: [{ model: Posts }]
        });
        const userId = user[0].id;
        const req_Id = req.params.id;

        const emailExists = await Users.findOne({ where: { email: req.body.email } });
        const emailExistsChck = await Users.findOne({ where: { email: req.body.email, id: userId } });
        const nomExists = await Users.findOne({ where: { nom: req.body.nom, prenom: req.body.prenom } });
        const nomExistsChck = await Users.findOne({ where: { nom: req.body.nom, prenom: req.body.prenom, id: userId } });

        if (nomExists) {
            if (!nomExistsChck) {
                return res.status(400).json({ msg: "Quelqu'un avec le même prénom que toi possède déjà ce nom" });
            }
        }

        if (emailExists) {
            if (!emailExistsChck) {
                return res.status(400).json({ msg: "Cette adresse email existe déjà" });
            }
        }

        if (userId == req_Id) {

            if (req.file) {
                const userImgDel = user[0].userImg;
                if (userImgDel != "128x128.png") {
                    fse.unlink(`../frontend/public/images/profilepictures/${userImgDel}`);
                }
            }

            const userUp = req.file ?
                {
                    ...req.body,
                    userImg: req.file.filename
                } : {
                    ...req.body
                };

            await Users.update(userUp, {
                where: { id: userId }
            });

            const postUp = req.file ?
                {
                    nom: req.body.nom,
                    prenom: req.body.prenom,
                    email: req.body.email,
                    userImg: req.file.filename
                } : {
                    nom: req.body.nom,
                    prenom: req.body.prenom,
                    email: req.body.email,

                };
            await Posts.update(postUp, {
                where: { userId: userId }
            });

            res.json({ msg: "Les informations de l'utilisateur ont bien été modifié" });
        } else {
            res.status(400).json({ msg: "Autorisation de modifier les informations de cet utilisateur refusée" });
        }

    } catch (error) {
        res.json({ msg: error.msg });
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../frontend/public/images/profilepictures')
    },
    filename: (req, file, cb) => {
        cb(null, req.body.nom + '-' + req.body.prenom + '_' + Date.now() + path.extname(file.originalname))
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
}).single('userImg')

export const deleteUser = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.sendStatus(204);

    try {
        const user = await Users.findAll({
            where: {
                refresh_token: refreshToken
            }
        });

        const isAdmin = user[0].isAdmin;
        const userId = user[0].id;
        const req_Id = req.params.id;

        const userImgDel = await Users.findOne({ where: { id: req_Id } });
        console.log(req_Id);
        if (isAdmin == 1) {
            await Users.destroy({
                where: {
                    id: req_Id
                }
            });
            if (userImgDel != "128x128.png") {
                fse.unlink(`../frontend/public/images/profilepictures/${userImgDel[0].userImg}`);
            }
            res.json({ msg: "Utilisateur supprimé" });
        } else if (userId == req_Id) {
            await Users.destroy({
                where: {
                    id: userId
                }
            });
            if (userImgDel != "128x128.png") {
                fse.unlink(`../frontend/public/images/profilepictures/${user[0].userImg}`);
            }
            res.json({ msg: "Utilisateur supprimé" });
        } else {
            res.status(400).json({ msg: "Autorisation de supprimer cet utilisateur refusée" });
        }

    } catch (error) {
        res.json({ msg: error.msg });
    }
}