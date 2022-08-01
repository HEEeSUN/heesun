import express from "express";
import { refresh } from "../middleware/auth.js";

const router = express.Router();

function chattingRouter(chattingController) {
  router.get("/", refresh, chattingController.getChattings);
  router.post("/", chattingController.joinRoom);
  router.get("/:id", refresh, chattingController.getMessage);
  router.post("/:id", refresh, chattingController.sendMessage);
  router.delete("/:id", chattingController.deleteChatting);

  return router;
}

export default chattingRouter;
