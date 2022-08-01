import express from "express";
import { isAuth, refresh } from "../../middleware/customer/auth.js";

const router = express.Router();

function userRouter(userController) {
  router.get("/auth", refresh, userController.refreshAuth);
  router.get("/logout", userController.logout);
  router.post("/login", userController.login);
  router.post("/login/:id", userController.kakaoLogin);
  router.post("/signup", userController.signup);
  router.post("/search", userController.searchUserInfo);

  router.get("/order", isAuth, userController.getMyInfo);
  router.post("/order", isAuth, userController.payment, userController.order);
  router.post("/order/paycomplete", isAuth, userController.paycomplete);
  router.post(
    "/order/cancel",
    isAuth,
    userController.cancelPayment,
    userController.addCart
  );

  router.get("/refund/:id", isAuth, userController.getOrder);
  router.post("/refund", isAuth, userController.refund);
  router.post("/refund/paycomplete", isAuth, userController.paycomplete);
  router.post("/refund/cancel", isAuth, userController.cancelRefund);
  router.post("/refund/:id", isAuth, userController.cancelOrder);

  router.get("/cart", isAuth, userController.cart);
  router.post("/cart", isAuth, userController.addCart);
  router.delete("/cart", isAuth, userController.removeProductInCART);

  router.get("/info", isAuth, userController.info);
  router.get("/info/myInfo", isAuth, userController.getMyInfo);
  router.post("/info/myInfo", isAuth, userController.modifyUserInfo);
  router.get("/info/delivery", isAuth, userController.deliveryStatus);

  router.get("/review", isAuth, userController.getMyReview);
  router.post("/review", isAuth, userController.writeReview);

  router.get("/post", isAuth, userController.getMyPost);

  return router;
}

export default userRouter;