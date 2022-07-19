import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Comments = db.define('comments',
    {
        commentMsg: { type: DataTypes.STRING, allowNull: false }
    }
);

export default Comments;