import express from "express";
import { upload, resize } from "../../middleware/admin/fileUpload.js";

const router = express.Router();

function adminRouter(adminAuth, adminController, chattingController) {
  router.get("/", adminAuth.isAuth, adminController.getMenuList);
  router.post("/", adminController.login);
  router.get("/logout", adminController.logout);
  router.get("/auth", adminAuth.refresh, adminController.refresh);
  router.get("/home", adminAuth.isAuth, adminController.getDashboardData);
  router.post("/account", adminAuth.isAuth, adminAuth.accessableMenu, adminController.create);

  router.get(
    "/products",
    adminAuth.isAuth,
    adminAuth.accessableMenu,
    adminController.getProducts
  );
  router.post(
    "/products",
    adminAuth.isAuth,
    adminAuth.accessableMenu,
    upload.single("uploadedImage"),
    resize,
    adminController.addProduct
  );
  router.post(
    "/products/codeCheck",
    adminAuth.isAuth,
    adminAuth.accessableMenu,
    adminController.checkProductCode
  );
  router.get(
    "/products/:id",
    adminAuth.isAuth,
    adminAuth.accessableMenu,
    adminController.getProduct
  );
  router.patch(
    "/products/:id",
    adminAuth.isAuth,
    adminAuth.accessableMenu,
    upload.single("uploadedImage"),
    resize,
    adminController.updateProduct
  );
  router.delete(
    "/products/:id",
    adminAuth.isAuth,
    adminAuth.accessableMenu,
    adminController.deleteProduct
  );

  router.get(
    "/discount",
    adminAuth.isAuth,
    adminAuth.accessableMenu,
    adminController.getSaleProducts
  );
  router.post(
    "/discount",
    adminAuth.isAuth,
    adminAuth.accessableMenu,
    adminController.addSaleProduct
  );
  router.patch(
    "/discount",
    adminAuth.isAuth,
    adminAuth.accessableMenu,
    adminController.updateSaleProduct
  );
  router.delete(
    "/discount/:id",
    adminAuth.isAuth,
    adminAuth.accessableMenu,
    adminController.deleteSaleProduct
  );

  router.get(
    "/orders",
    adminAuth.isAuth,
    adminAuth.accessableMenu,
    adminController.getOrders
  );
  router.get(
    "/orders/status",
    adminAuth.isAuth,
    adminAuth.accessableMenu,
    adminController.getOrderBySpecificStatus
  );
  router.get(
    "/orders/:id",
    adminAuth.isAuth,
    adminAuth.accessableMenu,
    adminController.deliveryStatus
  );
  router.patch(
    "/orders/:id",
    adminAuth.isAuth,
    adminAuth.accessableMenu,
    adminController.updateStatus
  );
  router.post(
    "/orders/refund",
    adminAuth.isAuth,
    adminAuth.accessableMenu,
    adminController.refund
  );

  router.get(
    "/inquiries",
    adminAuth.isAuth,
    adminAuth.accessableMenu,
    chattingController.getChattings
  );
  router.get(
    "/inquiries/:id",
    adminAuth.isAuth,
    adminAuth.accessableMenu,
    chattingController.getMessage
  );
  router.post(
    "/inquiries/:id",
    adminAuth.isAuth,
    adminAuth.accessableMenu,
    chattingController.sendMesage
  );
  router.delete(
    "/inquiries/:id",
    adminAuth.isAuth,
    adminAuth.accessableMenu,
    chattingController.deleteChatting
  );

  return router;
}

export default adminRouter;
