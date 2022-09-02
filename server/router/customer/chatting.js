import express from "express";

const router = express.Router();

function chattingRouter(customerAuth, chattingController) {
  router.all("/", customerAuth.refresh);
  
  router.get("/", chattingController.getChattings);
  router.post("/", chattingController.joinRoom);
  router.get("/:id", chattingController.getMessage);
  router.post("/:id", chattingController.sendMessage);
  router.delete("/:id", chattingController.setDisabledChatting);

  return router;
}

export default chattingRouter;
