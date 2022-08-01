import express from "express";
import { upload, resize } from "../../middleware/admin/fileUpload.js";
import {
  auth,
  accessableMenu,
  refresh,
} from "../../middleware/admin/auth.js";

const router = express.Router();

function adminRouter(adminController) {
  router.get("/", auth, adminController.getMenuList);
  router.post("/", adminController.login);
  router.get("/logout", adminController.logout);
  router.get("/auth", refresh, adminController.refresh);
  router.get("/home", auth, adminController.getDashboardData);
  router.post("/account", auth, accessableMenu, adminController.create);
 
  router.get(
    "/products",
    auth,
    accessableMenu,
    adminController.getProducts
  );
  router.post(
    "/products",
    auth,
    accessableMenu,
    upload.single("uploadedImage"),
    resize,
    adminController.addProduct
  );
  router.post(
    "/products/codeCheck",
    auth,
    accessableMenu,
    adminController.checkProductCode
  );
  router.get(
    "/products/:id",
    auth,
    accessableMenu,
    adminController.getProduct
  );
  router.patch(
    "/products/:id",
    auth,
    accessableMenu,
    upload.single("uploadedImage"),
    resize,
    adminController.updateProduct
  );
  router.delete(
    "/products/:id",
    auth,
    accessableMenu,
    adminController.deleteProduct
  );

  router.get(
    "/discount",
    auth,
    accessableMenu,
    adminController.getSaleProducts
  );
  router.post(
    "/discount",
    auth,
    accessableMenu,
    adminController.addSaleProduct
  );
  router.patch(
    "/discount",
    auth,
    accessableMenu,
    adminController.updateSaleProduct
  );
  router.delete(
    "/discount/:id",
    auth,
    accessableMenu,
    adminController.deleteSaleProduct
  );

  router.get(
    "/orders",
    auth,
    accessableMenu,
    adminController.getOrders
  );
  router.get(
    "/orders/status",
    auth,
    accessableMenu,
    adminController.getOrderBySpecificStatus
  );
  router.get(
    "/orders/:id",
    auth,
    accessableMenu,
    adminController.deliveryStatus
  );
  router.patch(
    "/orders/:id",
    auth,
    accessableMenu,
    adminController.updateStatus
  );
  router.post(
    "/orders/refund",
    auth,
    accessableMenu,
    adminController.refund
  );

  router.get(
    "/inquiries",
    auth,
    accessableMenu,
    adminController.getInquiries
  );
  router.get(
    "/inquiries/:id",
    auth,
    accessableMenu,
    adminController.testGetInquiry
  );
  router.post(
    "/inquiries/:id",
    auth,
    accessableMenu,
    adminController.sendMessage
  );
  router.delete(
    "/inquiries/:id",
    auth,
    accessableMenu,
    adminController.deleteInquiry
  );

  return router;
}

export default adminRouter;
