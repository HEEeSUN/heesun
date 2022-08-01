import express from "express";
import { isAuth } from "../../middleware/customer/auth.js";

const router = express.Router();

function communityRouter(communityController) {
  router.get("/comment", communityController.getComments);
  router.delete(
    "/comment/:id",
    isAuth,
    communityController.checkUniqueId,
    communityController.deleteComment
  ); //

  router.get("/", communityController.getAllPosts);
  router.post("/", isAuth, communityController.writePost);
  router.get(
    "/:id",
    communityController.checkUniqueId,
    communityController.getPost
  );
  router.post(
    "/:id",
    isAuth,
    communityController.checkUniqueId,
    communityController.writeComment
  );
  router.delete(
    "/:id",
    isAuth,
    communityController.checkUniqueId,
    communityController.deletePost
  );
  router.patch(
    "/:id",
    isAuth,
    communityController.checkUniqueId,
    communityController.modifyPost
  );

  return router;
}

export default communityRouter;