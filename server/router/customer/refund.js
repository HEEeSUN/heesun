import express from "express";

const router = express.Router();

function refundRouter(refundController, customerAuth) {
  router.all("/:id", customerAuth.isAuth);
  router.all("/:id/:id", customerAuth.isAuth);

  router.get("/:id", refundController.getOrder);
  router.post("/:id", refundController.validateRefundInformation, refundController.refund, refundController.requestRefund, refundController.failedRefund);
  router.delete("/:id", refundController.validateCancelInformation, refundController.cancelOrder);
  router.post("/:id/pay", refundController.validateRefundInformation, refundController.payment, refundController.refund);
  router.post("/:id/pay/complete", refundController.completePayment);
  router.post("/:id/pay/fail", refundController.failedPayment, refundController.failedRefund);
  
  return router;
}

export default refundRouter;