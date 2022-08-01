import jwt from "jsonwebtoken";
import * as adminRepository from "../data/admin.js";

const AUTH_ERROR = { code: "ERROR00001" };

export const authForAdmin = async (req, res, next) => {
  const token = req.cookies["token"];

  if (!token) {
    return res.status(401).json(AUTH_ERROR);
  }

  jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
    if (error) {
      return res.status(401).json(AUTH_ERROR);
    }

    const user = await adminRepository.findByAdminId(decoded.id);

    if (!user) {
      return res.status(401).json(AUTH_ERROR);
    }

    req.admin_id = user.admin_id;
    req.admin = user.admin;

    next();
  });
};

export const accessableMenu = async (req, res, next) => {
  const adminId = req.admin_id;

  const accessableMenu = await adminRepository.getMenuList(adminId);
  const accessPath = req.route.path.split("/")[1];

  const menu = accessableMenu.find((menu) => menu.path === accessPath);

  if (!menu) {
    return res.status(403).json({ message: "forbidden" });
  }

  next();
};

export const refresh = async (req, res, next) => {
  const token = req.cookies["token"];

  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
    if (error) {
      return next();
    }

    const admin = await adminRepository.findByAdminId(decoded.id);

    if (!admin) {
      return next();
    }

    req.admin_id = admin.admin_id;
    req.admin = admin.admin;

    next();
  });
};
