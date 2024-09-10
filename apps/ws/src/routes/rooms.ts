import express from "express";
import authMiddleware from "../middleware/auth";
import { createRoom, getUserRooms, joinRoom, leaveRoom } from "../controllers/rooms";
const router = express.Router();

router.get("/rooms", authMiddleware, getUserRooms);
router.post("/room", authMiddleware, createRoom);
router.post("/join-room", authMiddleware, joinRoom);
router.post("/leave-room", authMiddleware, leaveRoom);

export default router;
