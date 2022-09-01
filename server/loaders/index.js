import expressLoader from './express.js'
import databaseLoader from './database.js'
import initSocket from "../connection/socket.js";
import { Auth, AdminAuth } from "../middleware/auth.js";
import verifyClientUrl from "../middleware/verifyClientUrl.js";
import ChattingController from "../controller/chatting.js";
import AdminController from "../controller/admin/admin.js";
import CommunityController from "../controller/customer/community.js";
import ProductController from "../controller/customer/product.js";
import UserController from "../controller/customer/user.js";
import ChattingRepository from "../data/chatting.js";
import AdminRepository from "../data/admin/admin.js";
import CommunityRepository from "../data/customer/community.js";
import ProductRepository from "../data/customer/product.js";
import UserRepository from "../data/customer/user.js";

export default async ({ server, expressApp }) => {
  const db = await databaseLoader();

  const adminRepository = new AdminRepository(db)
  const chattingRepository = new ChattingRepository(db)
  const communityRepository = new CommunityRepository(db)
  const productRepository = new ProductRepository(db)
  const userRepository = new UserRepository(db)
  const customerAuth = new Auth(userRepository);
  const adminAuth = new AdminAuth(adminRepository);
  const adminController = new AdminController(adminRepository);
  const userController = new UserController(userRepository);
  const communityController = new CommunityController(communityRepository);
  const productController = new ProductController(productRepository);
  const chattingController = new ChattingController(chattingRepository);
  
  const middleware = {
    customerAuth,
    adminAuth,
    verifyClientUrl
  }
  const controllers = {
    adminController,
    userController,
    communityController,
    productController,
    chattingController
  }

  initSocket(server, process.env.CLIENT_URL, chattingController.deleteExpiredChatting);
  await expressLoader({ app: expressApp, middleware, controllers });
}