import express from "express";
import { upload } from "../../middleware/admin/fileUpload.js";

const router = express.Router();

function productRouter(adminController){
  router.get("/", adminController.getProducts);
  router.post("/", upload.single("uploadedImage"), adminController.addProduct);
  router.post("/codeCheck", adminController.checkProductCode);
  router.get("/:id", adminController.getProduct);
  router.patch("/:id", upload.single("uploadedImage"), adminController.updateProduct);
  router.delete("/:id", adminController.deleteProduct);

  return router;
}

export default productRouter;