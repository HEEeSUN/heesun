import express from "express";
import { upload, resize } from "../../middleware/admin/fileUpload.js";

const router = express.Router();

function adminRouter(adminAuth, adminController) {
  router.get("/", adminAuth.auth, adminController.getMenuList);
  router.post("/", adminController.login);
  router.get("/logout", adminController.logout);
  router.get("/auth", adminAuth.refresh, adminController.refresh);
  router.get("/home", adminAuth.auth, adminController.getDashboardData);
  router.post("/account", adminAuth.auth, adminAuth.accessableMenu, adminController.create);
 
  router.get(
    "/products",
    adminAuth.auth,
    adminAuth.accessableMenu,
    adminController.getProducts
  );
  router.post(
    "/products",
    adminAuth.auth,
    adminAuth.accessableMenu,
    upload.single("uploadedImage"),
    resize,
    adminController.addProduct
  );
  router.post(
    "/products/codeCheck",
    adminAuth.auth,
    adminAuth.accessableMenu,
    adminController.checkProductCode
  );
  router.get(
    "/products/:id",
    adminAuth.auth,
    adminAuth.accessableMenu,
    adminController.getProduct
  );
  router.patch(
    "/products/:id",
    adminAuth.auth,
    adminAuth.accessableMenu,
    upload.single("uploadedImage"),
    resize,
    adminController.updateProduct
  );
  router.delete(
    "/products/:id",
    adminAuth.auth,
    adminAuth.accessableMenu,
    adminController.deleteProduct
  );

  router.get(
    "/discount",
    adminAuth.auth,
    adminAuth.accessableMenu,
    adminController.getSaleProducts
  );
  router.post(
    "/discount",
    adminAuth.auth,
    adminAuth.accessableMenu,
    adminController.addSaleProduct
  );
  router.patch(
    "/discount",
    adminAuth.auth,
    adminAuth.accessableMenu,
    adminController.updateSaleProduct
  );
  router.delete(
    "/discount/:id",
    adminAuth.auth,
    adminAuth.accessableMenu,
    adminController.deleteSaleProduct
  );

  router.get(
    "/orders",
    adminAuth.auth,
    adminAuth.accessableMenu,
    adminController.getOrders
  );
  router.get(
    "/orders/status",
    adminAuth.auth,
    adminAuth.accessableMenu,
    adminController.getOrderBySpecificStatus
  );
  router.get(
    "/orders/:id",
    adminAuth.auth,
    adminAuth.accessableMenu,
    adminController.deliveryStatus
  );
  router.patch(
    "/orders/:id",
    adminAuth.auth,
    adminAuth.accessableMenu,
    adminController.updateStatus
  );
  router.post(
    "/orders/refund",
    adminAuth.auth,
    adminAuth.accessableMenu,
    adminController.refund
  );

  router.get(
    "/inquiries",
    adminAuth.auth,
    adminAuth.accessableMenu,
    adminController.getInquiries
  );
  router.get(
    "/inquiries/:id",
    adminAuth.auth,
    adminAuth.accessableMenu,
    adminController.testGetInquiry
  );
  router.post(
    "/inquiries/:id",
    adminAuth.auth,
    adminAuth.accessableMenu,
    adminController.sendMessage
  );
  router.delete(
    "/inquiries/:id",
    adminAuth.auth,
    adminAuth.accessableMenu,
    adminController.deleteInquiry
  );

  return router;
}

export default adminRouter;
