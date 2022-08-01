import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import initSocket from "./connection/socket.js";
import verifyClientUrl from "./middleware/verifyClientUrl.js";
import adminRouter from "./router/admin.js";
import chattingRouter from "./router/chatting.js";
import communityRouter from "./router/community.js";
import productRouter from "./router/product.js";
import userRouter from "./router/user.js";
import AdminController from "./controller/admin.js";
import { ChattingController } from "./controller/chatting.js";
import CommunityController from "./controller/community.js";
import ProductController from "./controller/product.js";
import UserController from "./controller/user.js";
import * as adminRepository from "./data/admin.js";
import * as chattingRepository from "./data/chatting.js";
import * as communityRepository from "./data/community.js";
import * as productRepository from "./data/product.js";
import * as userRepository from "./data/user.js";

console.log("- server is started -");
dotenv.config();

const __dirname = path.resolve();
const app = express();
const adminController = new AdminController(adminRepository);
const userController = new UserController(userRepository);
const communityController = new CommunityController(communityRepository);
const productController = new ProductController(productRepository);
const chattingController = new ChattingController(chattingRepository);

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/static", express.static(path.join(__dirname, "../static")));
app.use("/image", express.static(path.join(__dirname, "../public/image")));

app.use("/home", verifyClientUrl, productRouter(productController));
app.use("/admin", verifyClientUrl, adminRouter(adminController));
app.use("/member", verifyClientUrl, userRouter(userController));
app.use("/community", verifyClientUrl, communityRouter(communityController));
app.use("/chatting", verifyClientUrl, chattingRouter(chattingController));

app.use((req, res, next) => {
  return res.sendStatus(404);
});

app.use((error, req, res, next) => {
  console.error(error);
  return res.sendStatus(500);
});

const server = app.listen(parseInt(process.env.PORT));
initSocket(server, parseInt(process.env.PORT));
