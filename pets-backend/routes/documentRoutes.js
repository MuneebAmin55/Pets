import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import { createDocument, deleteDocument, getDocuments } from "../controller/documentController.js";

const router = Router();

router.use(requireAuth);
router.get("/", getDocuments);
router.post("/", createDocument);
router.delete("/:id", deleteDocument);

export default router;
