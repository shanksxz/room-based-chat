import { server, app } from "./socket";
import express from "express";
import { getEnvVariable } from "./utils";
import morgan from "morgan";
import msgRoutes from "./routes/messages";
import roomsRoutes from "./routes/rooms";
import cors from "cors";

// not using winston for logging
app.use(morgan("dev"));
app.use(cors({
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", msgRoutes);
app.use("/api", roomsRoutes);



const PORT = getEnvVariable('PORT');

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
