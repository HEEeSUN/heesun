import { useContext } from "react";
import { Route } from "react-router-dom";
import { Switch, useHistory } from "react-router";
import HttpClient from "./network/http";
import { AuthContext } from "./context/authcontext";
import { regex } from "./client/util/regex";
import OrderService from "./client/service/order";
import ProductService from "./client/service/product";
import MemberService from "./client/service/member";
import CommunityService from "./client/service/community";
import ChattingService from "./client/service/chatting";
import ContactService from "./client/service/contact";
import AdminService from "./admin/service/admin";
import AdminOrderService from "./admin/service/order";
import AdminProductService from "./admin/service/product";
import AdminDiscountService from "./admin/service/discount";
import AdminChattingService from "./admin/service/chatting";
import AdminInquiryService from "./admin/service/inquiry";
import AdminHome from "./admin/AdminHome";
import ClientHome from "./client/ClientHome";
import Main from "./client/page/Main";
import Admin from "./admin/page/Admin";

function App() {
  const sharedValue = useContext(AuthContext);
  const { login, logout, setMenus, expiredSession } = sharedValue;
  let history = useHistory();

  const memberAuthError = () => {
    history.push("/");
    memberService.logoff();
  };

  const adminAuthError = () => {
    history.push("/admin");
    adminService.logoff();
  };

  const baseURL = process.env.REACT_APP_BASE_URL;
  const httpClient = new HttpClient(
    baseURL,
    memberAuthError,
    adminAuthError,
    expiredSession
  );
  const memberService = new MemberService(httpClient, login, logout);
  const orderService = new OrderService(httpClient);
  const productService = new ProductService(httpClient);
  const communityService = new CommunityService(httpClient);
  const chattingService = new ChattingService(httpClient);
  const contactService = new ContactService(httpClient);
  const adminService = new AdminService(httpClient, login, logout, setMenus);
  const adminProductService = new AdminProductService(httpClient);
  const adminOrderService = new AdminOrderService(httpClient);
  const adminDiscountService = new AdminDiscountService(httpClient);
  const adminChattingService = new AdminChattingService(httpClient);
  const adminInquiryService = new AdminInquiryService(httpClient);

  return (
    <div className="App">
      <Switch>
        <Route exact path="/">
          <Main />
        </Route>
        <Route path="/home">
          <ClientHome
            productService={productService}
            memberService={memberService}
            communityService={communityService}
            chattingService={chattingService}
            contactService={contactService}
            orderService={orderService}
            regex={regex}
          />
        </Route>
        <Route exact path="/admin">
          <AdminHome />
        </Route>
        <Route path="/admin/:id">
          <Admin
            adminService={adminService}
            adminProductService={adminProductService}
            adminOrderService={adminOrderService}
            adminDiscountService={adminDiscountService}
            adminChattingService={adminChattingService}
            adminInquiryService={adminInquiryService}
            regex={regex}
          />
        </Route>
        <Route path="*">NOT FOUND</Route>
      </Switch>
    </div>
  );
}

export default App;
