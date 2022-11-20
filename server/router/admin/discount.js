import express from "express";

const router = express.Router();

function discountRouter(adminDisocuntController){
  router.get("/", adminDisocuntController.getSaleProducts);
  router.post("/", adminDisocuntController.addSaleProduct);
  router.patch("/", adminDisocuntController.updateSaleProduct);
  router.delete("/:id", adminDisocuntController.deleteSaleProduct);
  router.get("/products", adminDisocuntController.getAllProductsWithOption);

  return router;
}

export default discountRouter;