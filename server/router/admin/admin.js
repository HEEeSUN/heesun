import express from "express";
import productRouter from "./product.js";
import discountRouter from "./discount.js";
import orderRouter from "./order.js";
import chattingRouter from "./chatting.js";

const router = express.Router();

function adminRouter(adminAuth, adminController, chattingController, contactController) {
  router.post("/", adminController.login);
  router.get("/logout", adminController.logout);
  router.get("/auth", adminAuth.refresh, adminController.refresh);
  router.get("/home", adminAuth.isAuth, adminController.getDashboardData);
  
  router.all("/:id", adminAuth.isAuth, adminAuth.accessableMenu)
  router.all("/:id/:id", adminAuth.isAuth, adminAuth.accessableMenu)
  router.all("/:id/:id/:id", adminAuth.isAuth, adminAuth.accessableMenu)
  
  router.post("/account", adminController.create);
  router.use("/products", productRouter(adminController));;
  router.use("/discount", discountRouter(adminController));
  router.use("/orders", orderRouter(adminController));
  router.use("/inquiries", chattingRouter(chattingController));
  router.get("/contact", contactController.getInquiries);
  router.get("/contact/:id", contactController.getInquiry);
  router.post("/contact/:id", contactController.answer);
  
  return router;
}




export default adminRouter;