import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getAllMemories, deleteMemory } from "../controllers/memoryController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/memories", getAllMemories);
router.delete("/memories/:id", deleteMemory);

export default router;