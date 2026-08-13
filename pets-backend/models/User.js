import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const User = sequelize.define("User", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: true },
  googleId: { type: DataTypes.STRING, allowNull: true, unique: true },
  authProvider: { type: DataTypes.STRING, allowNull: false, defaultValue: "local" },
  completedCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  passwordResetOtp: { type: DataTypes.STRING, allowNull: true },
  passwordResetOtpExpires: { type: DataTypes.DATE, allowNull: true },
  passwordResetToken: { type: DataTypes.STRING, allowNull: true },
  passwordResetTokenExpires: { type: DataTypes.DATE, allowNull: true }
}, { tableName: "users" });

export default User;
