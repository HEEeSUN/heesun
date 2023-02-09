import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default class AdminController {
  constructor(adminRepository) {
    this.db = adminRepository;
  }

  /* 로그인 */
  login = async (req, res) => {
    try {
      const { admin, password } = req.body;

      const user = await this.db.findByUsername(admin);

      if (!user) {
        return res.status(401).json({ code: "ERROR00002" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ code: "ERROR00002" });
      }

      const menuList = await this.db.getMenuList(user.id);

      const token = this.createJwtToken(user.id);
      this.setToken(res, token);

      res.status(200).json({ menuList, username: user.username });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 로그아웃 */
  logout = async (req, res) => {
    return res.clearCookie("token", { domain: ".yuheesun.shop" }).send();
  };

  /* 새로고침 */
  refresh = async (req, res) => {
    try {
      const { userId, username } = req;
      let menuList = [];

      if (userId && username) {
        menuList = await this.db.getMenuList(userId);
      }

      return res.status(200).json({ username, menuList });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* dashboard에 표시될 데이터 */
  getDashboardData = async (req, res) => {
    try {
      let order = 0;
      let refund = 0;

      // new chatting 갯수
      const chattingList = await this.db.getAllChattings();

      let message = 0;
      for (let i = 0; i < chattingList.length; i++) {
        const result = await this.db.getNoReadMessage(
          chattingList[i].room_name
        );
        message += result.number;
      }

      // 결제완료, 환불요청 주문건
      const orderAndRefund = await this.db.getNewOrderAndNewRefund();

      const newOrder = orderAndRefund.find(
        (order) => order.status === "결제완료"
      );
      const newRefund = orderAndRefund.find(
        (order) => order.status === "반품및취소요청"
      );

      if (newOrder) {
        order = newOrder.number;
      }

      if (newRefund) {
        refund = newRefund.number;
      }

      //chart 6개월 판매액
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      const endDate = String(year) + String(month).padStart(2, "0");
      let startMonth = month - 6 + 1;
      let startYear = year;
      if (startMonth < 1) {
        startYear -= 1;
        startMonth += 12;
      }
      const startDate = String(startYear) + String(startMonth).padStart(2, "0");

      const salesOf6month = await this.db.get6month(startDate, endDate);
      let revenueOfCurrentMonth = 0;
      let currentMonth = salesOf6month.find((sale) => sale.month == endDate);

      if (currentMonth) {
        revenueOfCurrentMonth = currentMonth.revenue;
      }

      res.status(200).json({
        message,
        order,
        refund,
        sales: revenueOfCurrentMonth,
        salesOf6month,
      });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* admin 계정 생성 */
  create = async (req, res) => {
    try {
      const { admin, password, menuList } = req.body;
      const result = await this.db.findByUsername(admin);

      if (result) {
        return res.status(409).json({ code: "ERROR00003" });
      }

      const hashed = await bcrypt.hash(
        password,
        parseInt(process.env.BCRYPT_SALT_ROUNDS)
      );

      const menus = new Set(menuList);
      const menuIdList = Array.from(menus)
      const sortedMenu = menuIdList.sort();
      await this.db.createAdmin(admin, hashed, sortedMenu);

      res.sendStatus(201);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* JWT 생성 */
  createJwtToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });
  };

  /* 쿠키에 토큰 설정 */
  setToken = (res, token) => {
    const options = {
      httpOnly: true,
      domain: ".yuheesun.shop",
    };

    res.cookie("token", token, options);
  };
}
