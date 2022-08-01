import jwt from "jsonwebtoken";
import * as userRepository from "../data/user.js";

const AUTH_ERROR = { code: "ERROR00001" };

export const isAuth = async (req, res, next) => {
  const token = req.cookies["token"];

  if (!token) {
    return res.status(401).json(AUTH_ERROR);
  }

  jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
    if (error) {
      return res.status(401).json(AUTH_ERROR);
    }

    const user = await userRepository.findByUserId(decoded.id);

    if (!user) {
      return res.status(401).json(AUTH_ERROR);
    }

    req.userId = user.id; // req.customData
    req.username = user.username;

    next();
  });
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

    const user = await userRepository.findByUserId(decoded.id);

    if (!user) {
      return next();
    }

    req.userId = user.id; // req.customData
    req.username = user.username;

    next();
  });
};
