import express from "express";

const router = express.Router();

function contactRouter(contactController) {
  router.get("/", contactController.getInquiries);
  router.get("/:id", contactController.getInquiry);
  router.post("/:id", contactController.answer);
  
  return router;
}

export default contactRouter;