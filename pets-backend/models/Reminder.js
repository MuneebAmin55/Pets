import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Reminder = sequelize.define("Reminder", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  petId: { type: DataTypes.UUID, allowNull: false },
  petName: DataTypes.STRING,
  type: { type: DataTypes.STRING, allowNull: false, defaultValue: "vaccination" },
  title: { type: DataTypes.STRING, allowNull: false },
  dueDate: DataTypes.DATEONLY,
  due: DataTypes.STRING,
  notes: DataTypes.TEXT,
  completed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, { tableName: "reminders" });

export default Reminder;
