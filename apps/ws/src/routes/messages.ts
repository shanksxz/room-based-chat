import express from "express";
import authMiddleware from "../middleware/auth";
import { getMessages, sendMessage } from "../controllers/messages";
const router = express.Router();

router.get("/messages/:roomId", authMiddleware, getMessages);
router.post("/messages", authMiddleware, sendMessage);

export default router;