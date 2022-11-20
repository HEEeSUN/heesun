import express from "express";
import productRouter from "./product.js";
import discountRouter from "./discount.js";
import orderRouter from "./order.js";
import chattingRouter from "./chatting.js";
import contactRouter from "./contact.js";

const router = express.Router();

function adminRouter(adminAuth, adminController, adminControllers, chattingController, contactController) {
  router.post("/", adminController.login);
  router.get("/logout", adminController.logout);
  router.get("/auth", adminAuth.refresh, adminController.refresh);
  router.get("/home", adminAuth.isAuth, adminController.getDashboardData);
  
  router.all("/:id", adminAuth.isAuth, adminAuth.accessableMenu)
  router.all("/:id/:id", adminAuth.isAuth, adminAuth.accessableMenu)
  router.all("/:id/:id/:id", adminAuth.isAuth, adminAuth.accessableMenu)
  
  router.post("/account", adminController.create);
  router.use("/products", productRouter(adminControllers.adminProductController));;
  router.use("/discount", discountRouter(adminControllers.adminDiscountController));
  router.use("/orders", orderRouter(adminControllers.adminOrderController));
  router.use("/inquiries", chattingRouter(chattingController));
  router.use("/contact", contactRouter(contactController))
  
  return router;
}




export default adminRouter;