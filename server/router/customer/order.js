import express from "express";

const router = express.Router();

function OrderRouter(orderController) {
  router.get("/", orderController.getMyInfo);
  router.post("/", orderController.checkOrderInfo, orderController.payment, orderController.order);
  router.get("/:id", orderController.getLatestOrder);
  router.post("/failed", orderController.failedPayment, orderController.addCart);
  router.post("/complete", orderController.completePayment);
  return router;
}

export default OrderRouter;