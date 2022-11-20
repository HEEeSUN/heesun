import express from "express";
import { upload } from "../../middleware/admin/fileUpload.js";

const router = express.Router();

function productRouter(adminProductController){
  router.get("/", adminProductController.getProducts);
  router.post("/", upload.single("uploadedImage"), adminProductController.addProduct);
  router.post("/codeCheck", adminProductController.checkProductCode);
  router.get("/:id", adminProductController.getProduct);
  router.patch("/:id", upload.single("uploadedImage"), adminProductController.updateProduct);
  router.delete("/:id", adminProductController.deleteProduct);

  return router;
}

export default productRouter;