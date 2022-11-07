import express from "express";

const router = express.Router();

function orderRouter(adminController){
  router.get("/", adminController.getOrders);
  router.get("/refund", adminController.getPendingRefundList);
  router.post("/refund", adminController.refund, adminController.requestRefund);
  router.get("/:id", adminController.deliveryStatus);
  router.patch("/:id", adminController.updateStatus);

  return router;
}

export default orderRouter;