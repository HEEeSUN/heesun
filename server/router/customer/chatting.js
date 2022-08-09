import express from "express";

const router = express.Router();

function chattingRouter(customerAuth, chattingController) {
  router.get("/", customerAuth.refresh, chattingController.getChattings);
  router.post("/", chattingController.joinRoom);
  router.get("/:id", customerAuth.refresh, chattingController.getMessage);
  router.post("/:id", customerAuth.refresh, chattingController.sendMesage);
  router.delete("/:id", chattingController.setDisabledChatting);

  return router;
}

export default chattingRouter;
