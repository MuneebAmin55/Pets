import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const HealthRecord = sequelize.define("HealthRecord", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  petId: { type: DataTypes.UUID, allowNull: false },
  date: DataTypes.DATEONLY,
  type: { type: DataTypes.STRING, allowNull: false, defaultValue: "vaccination" },
  title: { type: DataTypes.STRING, allowNull: false },
  description: DataTypes.TEXT,
  notes: DataTypes.TEXT,
  veterinarian: DataTypes.STRING,
  nextDueDate: DataTypes.DATEONLY
}, { tableName: "health_records" });

export default HealthRecord;
