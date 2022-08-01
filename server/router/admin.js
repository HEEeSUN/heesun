import express from "express";
import { upload, resize } from "../middleware/fileUpload.js";
import {
  authForAdmin,
  accessableMenu,
  refresh,
} from "../middleware/authForAdmin.js";

const router = express.Router();

function adminRouter(adminController) {
  router.get("/", authForAdmin, adminController.getMenuList);
  router.post("/", adminController.login);
  router.get("/logout", adminController.logout);
  router.get("/auth", refresh, adminController.refresh);
  router.get("/home", authForAdmin, adminController.getDashboardData);
  router.post("/account", authForAdmin, accessableMenu, adminController.create);
 
  router.get(
    "/products",
    authForAdmin,
    accessableMenu,
    adminController.getProducts
  );
  router.post(
    "/products",
    authForAdmin,
    accessableMenu,
    upload.single("uploadedImage"),
    resize,
    adminController.addProduct
  );
  router.post(
    "/products/codeCheck",
    authForAdmin,
    accessableMenu,
    adminController.checkProductCode
  );
  router.get(
    "/products/:id",
    authForAdmin,
    accessableMenu,
    adminController.getProduct
  );
  router.patch(
    "/products/:id",
    authForAdmin,
    accessableMenu,
    upload.single("uploadedImage"),
    resize,
    adminController.updateProduct
  );
  router.delete(
    "/products/:id",
    authForAdmin,
    accessableMenu,
    adminController.deleteProduct
  );

  router.get(
    "/discount",
    authForAdmin,
    accessableMenu,
    adminController.getSaleProducts
  );
  router.post(
    "/discount",
    authForAdmin,
    accessableMenu,
    adminController.addSaleProduct
  );
  router.patch(
    "/discount",
    authForAdmin,
    accessableMenu,
    adminController.updateSaleProduct
  );
  router.delete(
    "/discount/:id",
    authForAdmin,
    accessableMenu,
    adminController.deleteSaleProduct
  );

  router.get(
    "/orders",
    authForAdmin,
    accessableMenu,
    adminController.getOrders
  );
  router.get(
    "/orders/status",
    authForAdmin,
    accessableMenu,
    adminController.getOrderBySpecificStatus
  );
  router.get(
    "/orders/:id",
    authForAdmin,
    accessableMenu,
    adminController.deliveryStatus
  );
  router.patch(
    "/orders/:id",
    authForAdmin,
    accessableMenu,
    adminController.updateStatus
  );
  router.post(
    "/orders/refund",
    authForAdmin,
    accessableMenu,
    adminController.refund
  );

  router.get(
    "/inquiries",
    authForAdmin,
    accessableMenu,
    adminController.getInquiries
  );
  router.get(
    "/inquiries/:id",
    authForAdmin,
    accessableMenu,
    adminController.testGetInquiry
  );
  router.post(
    "/inquiries/:id",
    authForAdmin,
    accessableMenu,
    adminController.sendMessage
  );
  router.delete(
    "/inquiries/:id",
    authForAdmin,
    accessableMenu,
    adminController.deleteInquiry
  );

  return router;
}

export default adminRouter;
