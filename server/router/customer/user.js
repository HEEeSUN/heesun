import express from "express";

const router = express.Router();

function userRouter(customerAuth, userController) {
  router.get("/auth", customerAuth.refresh, userController.refreshAuth);
  router.get("/logout", userController.logout);
  router.post("/login", userController.login);
  router.post("/login/:id", userController.kakaoLogin);
  router.post("/signup", userController.signup);
  router.post("/search", userController.searchUserInfo);

  router.get("/order", customerAuth.isAuth, userController.getMyInfo);
  router.post("/order", customerAuth.isAuth, userController.payment, userController.order);
  router.post("/order/paycomplete", customerAuth.isAuth, userController.paycomplete);
  router.post(
    "/order/cancel",
    customerAuth.isAuth,
    userController.cancelPayment,
    userController.addCart
  );

  router.get("/refund/:id", customerAuth.isAuth, userController.getOrder);
  router.post("/refund", customerAuth.isAuth, userController.refund);
  router.post("/refund/paycomplete", customerAuth.isAuth, userController.paycomplete);
  router.post("/refund/cancel", customerAuth.isAuth, userController.cancelRefund);
  router.post("/refund/:id", customerAuth.isAuth, userController.cancelOrder);

  router.get("/cart", customerAuth.isAuth, userController.cart);
  router.post("/cart", customerAuth.isAuth, userController.addCart);
  router.delete("/cart", customerAuth.isAuth, userController.removeProductInCART);

  router.get("/info", customerAuth.isAuth, userController.info);
  router.get("/info/myInfo", customerAuth.isAuth, userController.getMyInfo);
  router.post("/info/myInfo", customerAuth.isAuth, userController.modifyUserInfo);
  router.get("/info/delivery", customerAuth.isAuth, userController.deliveryStatus);

  router.get("/review", customerAuth.isAuth, userController.getMyReview);
  router.post("/review", customerAuth.isAuth, userController.writeReview);

  router.get("/post", customerAuth.isAuth, userController.getMyPost);

  return router;
}

export default userRouter;