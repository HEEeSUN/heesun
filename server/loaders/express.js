import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import yaml from 'yamljs'
import swaggerUI from 'swagger-ui-express'
import adminRouter from "../router/admin/admin.js";
import chattingRouter from "../router/customer/chatting.js";
import communityRouter from "../router/customer/community.js";
import productRouter from "../router/customer/product.js";
import userRouter from "../router/customer/user.js";
import contactRouter from "../router/customer/contact.js";

export default async ({ app, middleware, controllers }) => {
  const __dirname = path.resolve(); 
  const { customerAuth, adminAuth, verifyClientUrl, apiLimiter } = middleware;
  const {
    adminControllers,
    userController,
    communityController,
    productController,
    chattingController,
    contactController,
    orderController,
    refundController
  } = controllers;

  const {
    adminController
  } = adminControllers

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
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(openAPIDocument));

  app.use("/home", apiLimiter, verifyClientUrl, productRouter(productController));
  app.use("/admin", apiLimiter, verifyClientUrl, adminRouter(adminAuth, adminController, adminControllers, chattingController, contactController, refundController));
  app.use("/member", apiLimiter, verifyClientUrl, userRouter(customerAuth, userController, orderController, refundController));
  app.use("/community", apiLimiter, verifyClientUrl, communityRouter(customerAuth, communityController));
  app.use("/chatting", apiLimiter, verifyClientUrl, chattingRouter(customerAuth, chattingController));
  app.use("/contact", apiLimiter, verifyClientUrl, contactRouter(contactController));

  app.use((req, res, next) => {
    return res.sendStatus(404);
  });

  app.use((error, req, res, next) => {
    console.error(error);
    return res.sendStatus(error.statusCode || 500);
  });
}





