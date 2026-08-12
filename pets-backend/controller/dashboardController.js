import sequelize from "../config/database.js";
import { Pet, HealthRecord, Reminder, User } from "../models/index.js";
import { Op } from "sequelize";
import { randomUUID } from "crypto";

const asPlain = (item) => item.get({ plain: true });
const isUuid = (value) =>
  typeof value === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const ensureUuid = (value) => (isUuid(value) ? value : randomUUID());

export const getDashboard = async (req, res) => {
  try {
    const [user, pets, records, reminders] = await Promise.all([
      User.findByPk(req.user.id),
      Pet.findAll({ where: { userId: req.user.id }, order: [["createdAt", "ASC"]] }),
      HealthRecord.findAll({ include: [{ model: Pet, where: { userId: req.user.id }, attributes: [] }], order: [["date", "DESC"]] }),
      Reminder.findAll({ include: [{ model: Pet, where: { userId: req.user.id }, attributes: [] }], order: [["dueDate", "ASC"]] })
    ]);
    const healthRecords = {};
    records.forEach((record) => { const item = asPlain(record); (healthRecords[item.petId] ||= []).push(item); });
    res.json({ pets: pets.map(asPlain), tasks: reminders.map(asPlain), healthRecords, completedCount: user?.completedCount || 0 });
  } catch (error) { res.status(500).json({ message: "Unable to load dashboard", error: error.message }); }
};

export const saveDashboard = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { pets = [], tasks = [], healthRecords = {}, completedCount = 0 } = req.body;
    const userId = req.user.id;
    const petIds = pets.map((pet) => pet.id);
    const ownedPetIds = petIds.length ? petIds : ["00000000-0000-0000-0000-000000000000"];
    const recordItems = Object.entries(healthRecords).flatMap(([petId, items]) => (items || []).map((item) => ({ ...item, petId })));
    const reminderIds = tasks.map((task) => task.id);
    const recordIds = recordItems.map((record) => record.id);

    await Pet.destroy({ where: { userId, id: { [Op.notIn]: ownedPetIds } }, transaction });
    await Reminder.destroy({
      where: {
        petId: { [Op.in]: ownedPetIds },
        id: { [Op.notIn]: reminderIds.length ? reminderIds : ["00000000-0000-0000-0000-000000000000"] }
      },
      transaction
    });
    await HealthRecord.destroy({
      where: {
        petId: { [Op.in]: ownedPetIds },
        id: { [Op.notIn]: recordIds.length ? recordIds : ["00000000-0000-0000-0000-000000000000"] }
      },
      transaction
    });

    for (const pet of pets) {
      await Pet.upsert({ ...pet, id: ensureUuid(pet.id), userId }, { transaction });
    }
    for (const record of recordItems) {
      await HealthRecord.upsert({
        ...record,
        id: ensureUuid(record.id),
        description: record.description || record.notes
      }, { transaction });
    }
    for (const task of tasks) {
      const petId = task.petId || pets.find((p) => p.name === task.pet || p.name === task.petName)?.id;
      if (petId) {
        await Reminder.upsert({
          ...task,
          id: ensureUuid(task.id),
          petId,
          petName: task.petName || task.pet
        }, { transaction });
      }
    }
    await User.update({ completedCount: Number(completedCount) || 0 }, { where: { id: userId }, transaction });
    await transaction.commit();
    res.json({ message: "Dashboard saved", completedCount: Number(completedCount) || 0 });
  } catch (error) { await transaction.rollback(); res.status(500).json({ message: "Unable to save dashboard", error: error.message }); }
};
