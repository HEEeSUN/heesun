import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import initSocket from "./connection/socket.js";
import Database from "./db/database.js";
import verifyClientUrl from "./middleware/verifyClientUrl.js";
import { Auth, AdminAuth } from "./middleware/auth.js";
import adminRouter from "./router/admin/admin.js";
import chattingRouter from "./router/customer/chatting.js";
import communityRouter from "./router/customer/community.js";
import productRouter from "./router/customer/product.js";
import userRouter from "./router/customer/user.js";
import AdminController from "./controller/admin/admin.js";
import ChattingController from "./controller/customer/chatting.js";
import CommunityController from "./controller/customer/community.js";
import ProductController from "./controller/customer/product.js";
import UserController from "./controller/customer/user.js";
import AdminRepository from "./data/admin/admin.js";
import ChattingRepository from "./data/customer/chatting.js";
import CommunityRepository from "./data/customer/community.js";
import ProductRepository from "./data/customer/product.js";
import UserRepository from "./data/customer/user.js";

console.log("- server is started -");
dotenv.config();

const __dirname = path.resolve();
const app = express();
const database = new Database();
const db = database.db;
const adminRepository = new AdminRepository(db)
const chattingRepository = new ChattingRepository(db)
const communityRepository = new CommunityRepository(db)
const productRepository = new ProductRepository(db)
const userRepository = new UserRepository(db)
const customerAuth = new Auth(userRepository);
const adminAuth = new AdminAuth(adminRepository);
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
app.use("/admin", verifyClientUrl, adminRouter(adminAuth, adminController));
app.use("/member", verifyClientUrl, userRouter(customerAuth, userController));
app.use("/community", verifyClientUrl, communityRouter(customerAuth, communityController));
app.use("/chatting", verifyClientUrl, chattingRouter(customerAuth, chattingController));

app.use((req, res, next) => {
  return res.sendStatus(404);
});

app.use((error, req, res, next) => {
  console.error(error);
  return res.sendStatus(500);
});

const server = app.listen(parseInt(process.env.PORT));
initSocket(server, process.env.CLIENT_URL, chattingController.deleteExpiredChatting);