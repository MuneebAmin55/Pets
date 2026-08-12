import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Document = sequelize.define("Document", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  petId: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false, defaultValue: "certificate" },
  fileName: { type: DataTypes.STRING, allowNull: false },
  mimeType: { type: DataTypes.STRING, allowNull: false },
  fileData: { type: DataTypes.TEXT, allowNull: false },
  notes: { type: DataTypes.TEXT },
  expiresOn: DataTypes.DATEONLY,
}, {
  tableName: "documents",
});

export default Document;
