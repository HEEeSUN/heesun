import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import adminRouter from "../router/admin/admin.js";
import chattingRouter from "../router/customer/chatting.js";
import communityRouter from "../router/customer/community.js";
import productRouter from "../router/customer/product.js";
import userRouter from "../router/customer/user.js";
import contactRouter from "../router/customer/contact.js";
import yaml from 'yamljs'
import swaggerUI from 'swagger-ui-express'

export default async ({ app, middleware, controllers }) => {
  const __dirname = path.resolve(); 
  const { customerAuth, adminAuth, verifyClientUrl } = middleware;
  const {
    adminController,
    userController,
    communityController,
    productController,
    chattingController,
    contactController
  } = controllers;

  const openAPIDocument = yaml.load(path.join(__dirname, "/api/openapi.yaml"))
  
  app.use(express.json());
  app.use(
    cors({
      origin: [
        process.env.CLIENT_URL,
        process.env.OPEN_API_URL
      ],
        credentials: true,
    })
  );
  app.use(cookieParser());

  app.use("/static", express.static(path.join(__dirname, "../static")));
  app.use("/image", express.static(path.join(__dirname, "../public/image")));
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(openAPIDocument))

  app.use("/home", verifyClientUrl, productRouter(productController));
  app.use("/admin", verifyClientUrl, adminRouter(adminAuth, adminController, chattingController, contactController));
  app.use("/member", verifyClientUrl, userRouter(customerAuth, userController));
  app.use("/community", verifyClientUrl, communityRouter(customerAuth, communityController));
  app.use("/chatting", verifyClientUrl, chattingRouter(customerAuth, chattingController));
  app.use("/contact", verifyClientUrl, contactRouter(contactController));

  app.use((req, res, next) => {
    return res.sendStatus(404);
  });

  app.use((error, req, res, next) => {
    console.error(error);
    return res.sendStatus(500);
  });
}





