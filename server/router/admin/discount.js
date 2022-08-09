import express from "express";

const router = express.Router();

function discountRouter(adminController){
  router.get("/", adminController.getSaleProducts);
  router.post("/", adminController.addSaleProduct);
  router.patch("/", adminController.updateSaleProduct);
  router.delete("/:id", adminController.deleteSaleProduct);

  return router;
}

export default discountRouter;