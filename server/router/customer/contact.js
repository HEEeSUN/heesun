import express from "express";

const router = express.Router();

function contactRouter(contactController) {
  router.post("/", contactController.validationCheck, contactController.writeInquiry);

  return router;
}

export default contactRouter;
