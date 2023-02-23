import express from "express";

const router = express.Router();

function productRouter(productController) {
  router.get("/", productController.getAllProduct);
  router.get("/:id", productController.getProduct);
  router.get("/:id/reviews", productController.getReviews);

  return router;
}

export default productRouter;