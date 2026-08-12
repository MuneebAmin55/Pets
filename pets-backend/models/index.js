import User from "./User.js";
import Pet from "./Pet.js";
import HealthRecord from "./HealthRecord.js";
import Reminder from "./Reminder.js";
import Document from "./Document.js";

User.hasMany(Pet, { foreignKey: "userId", onDelete: "CASCADE" });
Pet.belongsTo(User, { foreignKey: "userId" });
Pet.hasMany(HealthRecord, { foreignKey: "petId", onDelete: "CASCADE" });
HealthRecord.belongsTo(Pet, { foreignKey: "petId" });
Pet.hasMany(Reminder, { foreignKey: "petId", onDelete: "CASCADE" });
Reminder.belongsTo(Pet, { foreignKey: "petId" });
User.hasMany(Document, { foreignKey: "userId", onDelete: "CASCADE" });
Pet.hasMany(Document, { foreignKey: "petId", onDelete: "CASCADE" });
Document.belongsTo(User, { foreignKey: "userId" });
Document.belongsTo(Pet, { foreignKey: "petId" });

export { User, Pet, HealthRecord, Reminder, Document };
