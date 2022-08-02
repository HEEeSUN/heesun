import express from "express";

const router = express.Router();

function communityRouter(customerAuth, communityController) {
  router.get("/comment", communityController.getComments);
  router.delete(
    "/comment/:id",
    customerAuth.isAuth,
    communityController.checkUniqueId,
    communityController.deleteComment
  ); 

  router.get("/", communityController.getAllPosts);
  router.post("/", customerAuth.isAuth, communityController.writePost);
  router.get(
    "/:id",
    communityController.checkUniqueId,
    communityController.getPost
  );
  router.post(
    "/:id",
    customerAuth.isAuth,
    communityController.checkUniqueId,
    communityController.writeComment
  );
  router.delete(
    "/:id",
    customerAuth.isAuth,
    communityController.checkUniqueId,
    communityController.deletePost
  );
  router.patch(
    "/:id",
    customerAuth.isAuth,
    communityController.checkUniqueId,
    communityController.modifyPost
  );

  return router;
}

export default communityRouter;