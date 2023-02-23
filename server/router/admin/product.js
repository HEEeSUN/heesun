import express from "express";
import { upload, gcpUpload } from "../../middleware/admin/gcpFileUpload.js";

const router = express.Router();

function productRouter(adminProductController){
  router.get("/", adminProductController.getProducts);
  router.post("/", upload.single("uploadedImage"), adminProductController.checkOption, adminProductController.addProduct, gcpUpload);
  router.post("/codeCheck", adminProductController.checkProductCode);
  router.get("/:id", adminProductController.getProduct);
  router.patch("/:id", upload.single("uploadedImage"), adminProductController.checkOption, adminProductController.updateProduct, gcpUpload);
  router.delete("/:id", adminProductController.deleteProduct);

  return router;
}

export default productRouter;