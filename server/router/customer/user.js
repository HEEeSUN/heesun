import express from "express";
import orderRouter from "./order.js";
import refundRouter from "./refund.js"

const router = express.Router();

function userRouter(customerAuth, userController, orderController, refundController) {
  router.get("/auth", customerAuth.refresh, userController.refreshAuth);
  router.get("/logout", userController.logout);
  router.post("/login", userController.login);
  router.post("/login/:id", userController.kakaoLogin);
  router.get("/signup", userController.idDuplicateCheck);
  router.post("/signup", userController.signup);
  router.post("/search", userController.searchUserInfo);

  router.all("/:id", customerAuth.isAuth)
  router.all("/:id/:id", customerAuth.isAuth)
  
  router.use("/order", orderRouter(orderController));;
  router.use("/refund", refundRouter(refundController, customerAuth));;

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