import express from "express";

const router = express.Router();

function communityRouter(customerAuth, communityController) {
  router.get("/", communityController.getAllPosts);
  router.post("/", customerAuth.isAuth, communityController.writePost);
  router.get("/:id", communityController.checkUniqueId, communityController.getPost);
  router.delete("/:id", customerAuth.isAuth, communityController.checkUniqueId, communityController.deletePost);
  router.patch("/:id", customerAuth.isAuth, communityController.checkUniqueId, communityController.modifyPost);
  
  router.get("/:id/comments", communityController.getComments);
  router.post("/:id/comments", customerAuth.isAuth, communityController.checkUniqueId, communityController.writeComment);
  router.delete("/:id/comments", customerAuth.isAuth, communityController.checkUniqueId, communityController.deleteComment); 

  return router;
}

export default communityRouter;