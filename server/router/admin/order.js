import express from "express";

const router = express.Router();

function orderRouter(adminController){
  router.get("/", adminController.getOrders);
  router.get("/status", adminController.getOrderBySpecificStatus);
  router.get("/:id", adminController.deliveryStatus);
  router.patch("/:id", adminController.updateStatus);
  router.post("/refund", adminController.refund, adminController.requestRefund);

  return router;
}

export default orderRouter;