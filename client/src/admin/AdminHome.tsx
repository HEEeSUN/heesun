import { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "./AdminHome.css";
import { AuthContext } from "../context/authcontext";
import { AdminService } from "./model/admin.model";
import { AdminProductService } from "./model/product.model";
import { AdminOrderService } from "./model/order.model";
import { AdminDiscountService } from "./model/discount.model";
import { AdminChattingService } from "./model/chatting.model";
import { regex } from "./util/regex";
import Login from "./page/login/Login";
import Admin from "./page/Admin";

type Props = {
  adminService: AdminService;
  adminProductService: AdminProductService;
  adminOrderService: AdminOrderService;
  adminDiscountService: AdminDiscountService;
  adminChattingService: AdminChattingService;
};

function AdminHome({
  adminService,
  adminProductService,
  adminOrderService,
  adminDiscountService,
  adminChattingService,
}: Props) {
  const sharedValue = useContext(AuthContext);
  const { loginState } = sharedValue;

  useEffect(() => {
    if (!loginState)
      adminService.auth();
    window.addEventListener("unload", handleTabClosing);

    return () => {
      window.removeEventListener("unload", handleTabClosing);
    };
  }, []);

  const handleTabClosing = () => {
    adminService.logoff();
  };

  return loginState ? (
    <>
      <MoveToLoginPage />
      <Admin
        adminService={adminService}
        adminProductService={adminProductService}
        adminOrderService={adminOrderService}
        adminDiscountService={adminDiscountService}
        adminChattingService={adminChattingService}
        regex={regex}
      />
    </>
  ) : (
    <Login adminService={adminService} />
  );
}

export default AdminHome;

function MoveToLoginPage() {
  let history = useHistory();

  useEffect(() => {
    history.push("/admin/home");
  }, []);
  return null;
}
