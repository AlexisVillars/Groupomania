import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Posts from "./PostModel.js";
import Comments from "./CommentModel.js";

const { DataTypes } = Sequelize;

const Users = db.define('users',
    {
        nom: { type: DataTypes.STRING, allowNull: false },
        prenom: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false },
        userImg: { type: DataTypes.STRING, allowNull: true },
        isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
        password: { type: DataTypes.STRING, allowNull: false },
        refresh_token: { type: DataTypes.TEXT }
    }
);

Users.hasMany(Posts, { onDelete: 'CASCADE' });
Users.hasMany(Comments, { onDelete: 'CASCADE' });
Posts.belongsTo(Users);
Comments.belongsTo(Users);

Posts.hasMany(Comments, { onDelete: 'CASCADE' });
Comments.belongsTo(Posts);


export default Users;