import { useState } from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import { AdminService, Menulist } from "../model/admin.model";
import { AdminProductService } from "../model/product.model";
import { AdminOrderService } from "../model/order.model";
import { AdminDiscountService } from "../model/discount.model";
import { AdminChattingService } from "../model/chatting.model";
import { Regex } from "../model/model";
import MenuList from "../components/MenuList";
import Dashboard from "./dashboard/Dashboard";
import Order from "./order/Order";
import Products from "./products/Products";
import ManageProduct from "./manageProducts/ManageProduct";
import Discount from "./discount/Discount";
import CreateAdmin from "./createAccount/CreateAdmin";
import ChattingList from "./chattings/ChattingList";

type Props = {
  adminService: AdminService;
  adminProductService: AdminProductService;
  adminOrderService: AdminOrderService;
  adminDiscountService: AdminDiscountService;
  adminChattingService: AdminChattingService;
  regex: Regex;
};

function Admin({
  adminService,
  adminProductService,
  adminOrderService,
  adminDiscountService,
  adminChattingService,
  regex,
}: Props) {
  let [menuList, setMenuList] = useState<Menulist[]>([]);
  let [refundNum, setRefundNum] = useState<number>(0);
  let history = useHistory();

  const logout = async () => {
    await adminService.logoff();
    history.push("/admin");
  };

  return (
    <Switch>
      <Route path="/admin/:id">
        <div className="admin">
          <MenuList
            adminService={adminService}
            menuList={menuList}
            setMenuList={setMenuList}
            logout={logout}
          />
          <div className="adminHome">
            <Route exact path="/admin/home">
              <Dashboard
                adminProductService={adminProductService}
                setRefundNum={setRefundNum}
              />
            </Route>
            <Route exact path="/admin/orders">
              <Order
                adminOrderService={adminOrderService}
                refundNum={refundNum}
              />
            </Route>
            <Route exact path="/admin/products">
              <ManageProduct adminProductService={adminProductService} />
            </Route>
            <Route exact path="/admin/discount">
              <Discount adminDiscountService={adminDiscountService} />
            </Route>
            <Route exact path="/admin/account">
              <CreateAdmin
                adminService={adminService}
                menuList={menuList}
                regex={regex}
              />
            </Route>
            <Route exact path="/admin/inquiries">
              <ChattingList adminChattingService={adminChattingService} />
            </Route>
            <Route exact path="/admin/products/add">
              <Products adminProductService={adminProductService} />
            </Route>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

export default Admin;
