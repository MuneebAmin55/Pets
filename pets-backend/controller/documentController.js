import { randomUUID } from "crypto";
import { Document, Pet } from "../models/index.js";

const ensureUuid = (value) => (typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : randomUUID());

const mapDocument = (document) => {
  const plain = document.get({ plain: true });
  return {
    ...plain,
    petName: plain.Pet?.name || plain.petName || "",
    petSpecies: plain.Pet?.species || plain.petSpecies || "",
  };
};

export const getDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      where: { userId: req.user.id },
      include: [{ model: Pet, attributes: ["id", "name", "species"] }],
      order: [["createdAt", "DESC"]],
    });

    return res.json({ documents: documents.map(mapDocument) });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load documents", error: error.message });
  }
};

export const createDocument = async (req, res) => {
  try {
    const { petId, title, category, fileName, mimeType, fileData, notes = "", expiresOn = null } = req.body;

    if (!petId || !title || !fileName || !mimeType || !fileData) {
      return res.status(400).json({ message: "Pet, title, file, and file type are required" });
    }

    const pet = await Pet.findOne({ where: { id: petId, userId: req.user.id } });
    if (!pet) {
      return res.status(400).json({ message: "Choose a valid pet for this document" });
    }

    const created = await Document.create({
      id: ensureUuid(req.body.id),
      userId: req.user.id,
      petId,
      title,
      category: category || "certificate",
      fileName,
      mimeType,
      fileData,
      notes,
      expiresOn: expiresOn || null,
    });

    return res.status(201).json({ document: mapDocument(await Document.findByPk(created.id, { include: [{ model: Pet, attributes: ["id", "name", "species"] }] })) });
  } catch (error) {
    return res.status(500).json({ message: "Unable to save document", error: error.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    await document.destroy();
    return res.json({ message: "Document deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete document", error: error.message });
  }
};
