import express from "express";
import refundRouter from "./refund.js";

const router = express.Router();

function orderRouter(adminOrderController, refundController){
  router.use("/refund", refundRouter(refundController));
  router.get("/", adminOrderController.getOrders);
  router.get("/:id", adminOrderController.checkOrderId, adminOrderController.deliveryStatus);
  router.patch("/:id", adminOrderController.checkOrderId, adminOrderController.updateStatus);

  return router;
}

export default orderRouter;