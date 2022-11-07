import express from "express";

const router = express.Router();

function chattingRouter(chattingController){
  router.get("/", chattingController.getChattings);
  router.get("/:id", chattingController.getMessages);
  router.post("/:id", chattingController.sendMessage);
  router.delete("/:id", chattingController.deleteChatting);
  router.get("/:id/new", chattingController.getNewMessage);
  
  return router;
}

export default chattingRouter;