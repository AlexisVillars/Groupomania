import { Sequelize } from "sequelize";

const db = new Sequelize('groupomania_db', 'root', '', {
    host: "localhost",
    dialect: "mysql",
    logging: false
});

(async () => { await db.sync(); })();

export default db;