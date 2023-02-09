import express from "express";

const router = express.Router();

function refundRouter(refundController){
  router.get("/", refundController.getPendingRefundList);
  router.get("/:id", refundController.getPendingRefundDetail);
  router.post("/:id", refundController.refundByAdmin, refundController.requestRefund, refundController.failedRefundByAdmin);

  return router;
}

export default refundRouter;