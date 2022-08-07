import express from "express";

const router = express.Router();

function chattingRouter(customerAuth, chattingController) {
  router.get("/", customerAuth.refresh, chattingController.getChattings);
  router.post("/", chattingController.joinRoom);
  router.get("/:id", customerAuth.refresh, chattingController.getMessage);
  // router.post("/:id", customerAuth.refresh, chattingController.sendMessage);
  router.post("/:id", customerAuth.refresh, chattingController.testSendMessage);
  router.delete("/:id", chattingController.deleteChatting);

  return router;
}

export default chattingRouter;
