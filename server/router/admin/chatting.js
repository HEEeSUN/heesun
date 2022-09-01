import express from "express";

const router = express.Router();

function chattingRouter(chattingController){
  router.get("/", chattingController.getChattings);
  router.get("/:id", chattingController.getMessage);
  router.post("/:id", chattingController.sendMessage);
  router.delete("/:id", chattingController.deleteChatting);
  
  return router;
}

export default chattingRouter;