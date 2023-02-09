import expressLoader from "./express.js";
import Database from "./database.js";
import initSocket from "../connection/socket.js";
import { Auth, AdminAuth } from "../middleware/auth.js";
import verifyClientUrl from "../middleware/verifyClientUrl.js";
import ChattingController from "../controller/chatting.js";
import ContactController from "../controller/contact.js";
import RefundController from "../controller/refund.js";
import AdminController from "../controller/admin/admin.js";
import AdminDiscountController from "../controller/admin/discount.js";
import AdminOrderController from "../controller/admin/order.js";
import AdminProductController from "../controller/admin/product.js";
import CommunityController from "../controller/customer/community.js";
import ProductController from "../controller/customer/product.js";
import UserController from "../controller/customer/user.js";
import UserOrderController from "../controller/customer/order.js";
import ChattingRepository from "../data/chatting.js";
import ContactRepository from "../data/contact.js";
import RefundRepository from "../data/refund.js";
import AdminRepository from "../data/admin/admin.js";
import AdminDiscountRepository from "../data/admin/discount.js";
import AdminOrderRepository from "../data/admin/order.js";
import AdminProductRepository from "../data/admin/product.js";
import CommunityRepository from "../data/customer/community.js";
import ProductRepository from "../data/customer/product.js";
import UserRepository from "../data/customer/user.js";
import UserOrderRepository from "../data/customer/order.js";

export default async ({ server, expressApp }) => {
  const db = new Database();

  const adminRepository = new AdminRepository(db);
  const adminDiscountRepository = new AdminDiscountRepository(db);
  const adminOrderRepository = new AdminOrderRepository(db);
  const adminProductRepository = new AdminProductRepository(db);
  const chattingRepository = new ChattingRepository(db);
  const communityRepository = new CommunityRepository(db);
  const productRepository = new ProductRepository(db);
  const userRepository = new UserRepository(db);
  const contactRepository = new ContactRepository(db);
  const refundRepository = new RefundRepository(db);
  const userOrderRepository = new UserOrderRepository(db);
  
  const customerAuth = new Auth(userRepository);
  const adminAuth = new AdminAuth(adminRepository);
  const adminController = new AdminController(adminRepository);
  const adminDiscountController = new AdminDiscountController(adminDiscountRepository);
  const adminOrderController = new AdminOrderController(adminOrderRepository);
  const adminProductController = new AdminProductController(adminProductRepository);
  const userController = new UserController(userRepository);
  const orderController = new UserOrderController(userOrderRepository);
  const communityController = new CommunityController(communityRepository);
  const productController = new ProductController(productRepository);
  const chattingController = new ChattingController(chattingRepository);
  const contactController = new ContactController(contactRepository);
  const refundController = new RefundController(refundRepository);

  const middleware = {
    customerAuth,
    adminAuth,
    verifyClientUrl
  };

  const adminControllers = {
    adminController,
    adminDiscountController,
    adminOrderController,
    adminProductController,
  };

  const controllers = {
    adminControllers,
    userController,
    communityController,
    productController,
    chattingController,
    contactController,
    refundController,
    orderController,
  };

  initSocket(
    server,
    process.env.CLIENT_URL,
    chattingController.deleteExpiredChatting
  );
  await expressLoader({ app: expressApp, middleware, controllers });
};
