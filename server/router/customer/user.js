import express from "express";

const router = express.Router();

function userRouter(customerAuth, userController) {
  router.get("/auth", customerAuth.refresh, userController.refreshAuth);
  router.get("/logout", userController.logout);
  router.post("/login", userController.login);
  router.post("/login/:id", userController.kakaoLogin);
  router.get("/signup", userController.idDuplicateCheck);
  router.post("/signup", userController.signup);
  router.post("/search", userController.searchUserInfo);

  router.all("/:id", customerAuth.isAuth)
  router.all("/:id/:id", customerAuth.isAuth)

  router.get("/order", userController.getMyInfo);
  router.post("/order", userController.payment, userController.order);
  router.post("/order/paycomplete", userController.paycomplete);
  router.post("/order/cancel", userController.cancelPayment, userController.addCart);

  router.post("/refund", userController.refund);
  router.post("/refund/imp", userController.requestRefund);
  router.post("/refund/paycomplete", userController.paycomplete);
  router.post("/refund/cancel", userController.requestToCancelRefund);
  router.get("/refund/:id", userController.getOrder);
  router.post("/refund/:id", userController.cancelOrder);

  router.get("/cart", userController.cart);
  router.post("/cart", userController.addCart);
  router.delete("/cart", userController.removeProductInCART);

  router.get("/info", userController.info);
  router.get("/info/myInfo", userController.getMyInfo);
  router.post("/info/myInfo", userController.modifyUserInfo);
  router.get("/info/:id", userController.deliveryStatus);

  router.get("/review", userController.getMyReview);
  router.post("/review", userController.writeReview);

  router.get("/post", userController.getMyPost);

  return router;
}

export default userRouter;