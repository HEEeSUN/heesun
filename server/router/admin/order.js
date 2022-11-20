import express from "express";

const router = express.Router();

function orderRouter(adminOrderController){
  router.get("/", adminOrderController.getOrders);
  router.get("/refund", adminOrderController.getPendingRefundList);
  router.post("/refund", adminOrderController.refund, adminOrderController.requestRefund);
  router.get("/:id", adminOrderController.deliveryStatus);
  router.patch("/:id", adminOrderController.updateStatus);

  return router;
}

export default orderRouter;