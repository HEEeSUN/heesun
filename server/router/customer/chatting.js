import express from "express";

const router = express.Router();

function chattingRouter(customerAuth, chattingController) {
  router.all("/", customerAuth.refresh);
  router.all("/:id", customerAuth.refresh, chattingController.checkRoomname);
  router.all("/:id/new", customerAuth.refresh, chattingController.checkRoomname);

  router.get("/", chattingController.getChattings);
  router.post("/", chattingController.joinRoom);
  router.get("/:id", chattingController.getMessages);
  router.post("/:id", chattingController.sendMessage);
  router.delete("/:id", chattingController.setDisabledChatting);
  router.get("/:id/new", chattingController.getNewMessage);

  return router;
}

export default chattingRouter;
