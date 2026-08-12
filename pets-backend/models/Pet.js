import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Pet = sequelize.define("Pet", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  species: { type: DataTypes.STRING, allowNull: false, defaultValue: "Dog" },
  breed: DataTypes.STRING,
  age: DataTypes.STRING,
  gender: DataTypes.STRING,
  weight: DataTypes.STRING,
  weightUnit: DataTypes.STRING,
  icon: DataTypes.STRING,
  color: DataTypes.STRING,
  status: DataTypes.STRING
}, { tableName: "pets" });

export default Pet;
