import { useContext, useEffect, useState } from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import { AdminService } from "../model/admin.model";
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
import { AuthContext } from "../../context/authcontext";
import Popup from "../components/Popup";
import Login from "./login/Login";

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
  const sharedValue = useContext(AuthContext)
  const { loginState, sessionState, menuList } = sharedValue;
  let [showPopup, setShowPopup] = useState<boolean>(false);
  let history = useHistory();

  const closePopup = async () => {
    setShowPopup(false);
    adminService.logoff();
  }

  const logout = async () => {
    await adminService.logoff();
    history.push("/admin");
  };

  const loginPopup = <Login adminService={adminService} />

  useEffect(()=>{ 
    if(!sessionState && loginState) {
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  },[sessionState])
  
  useEffect(()=>{
    if (!sessionState && !loginState) {
      adminService.auth();
    }
  },[])

  return (
    <Route path="/admin/:id">
      <div className="admin">
        {
          !loginState
          ? <Login adminService={adminService}/>
          : <>
              {
                sessionState
                ? <> 
                    <MenuList
                      menuList={menuList}
                      logout={logout}
                    />
                    <div className="adminHome">
                      <Switch>
                        <Route exact path="/admin/home">
                          <Dashboard
                              adminProductService={adminProductService}
                            />
                        </Route>
                        <Route exact path="/admin/orders">
                          <Order
                            adminOrderService={adminOrderService}
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
                        <Route path="*">
                          NOT FOUND
                        </Route>
                      </Switch>
                    </div>
                  </>
                : <div className="adminHome">
                    {
                      showPopup &&
                      <Popup 
                        children={loginPopup}
                        title="login"
                        setPopup={setShowPopup}
                        handleClose={closePopup}
                      />          
                    }
                  </div>
              }
            </>
        }
      </div>
    </Route>
  );
}

export default Admin;
