import express from "express";

const router = express.Router();

function contactRouter(contactController) {
  router.post("/", contactController.writeInquiry);

  return router;
}

export default contactRouter;
