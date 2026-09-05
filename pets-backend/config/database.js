import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const connectionOptions = {
    dialect: "postgres",
    logging: false,
    ...(process.env.DATABASE_URL
        ? {
              dialectOptions: {
                  ssl: { require: true, rejectUnauthorized: false }
              }
          }
        : {})
};

const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, connectionOptions)
    : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
          ...connectionOptions,
          host: process.env.DB_HOST,
          port: process.env.DB_PORT
      });

export default sequelize;