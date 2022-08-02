import jwt from "jsonwebtoken";

export class Auth {
  #AUTH_ERROR =  { code: "ERROR00001" };

  constructor(dataRepository){
    this.dataRepository = dataRepository;
  }

  isAuth = async (req, res, next) => {
    const token = req.cookies["token"];

    if (!token) {
      return res.status(401).json(this.#AUTH_ERROR);
    }
  
    jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
      if (error) {
        return res.status(401).json(AUTH_ERROR);
      }
  
      const user = await this.dataRepository.findById(decoded.id);

      if (!user) {
        return res.status(401).json(AUTH_ERROR);
      }
  
      req.userId = user.id;
      req.username = user.username;
  
      next();
    });
  }

  refresh = async (req, res, next) => {
    const token = req.cookies["token"];

    if (!token) {
      return next();
    }
  
    jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
      if (error) {
        return next();
      }
  
      const user = await this.dataRepository.findById(decoded.id);
  
      if (!user) {
        return next();
      }
  
      req.userId = user.id;
      req.username = user.username;
  
      next();
    });
  }
}

export class AdminAuth extends Auth {
  accessableMenu = async (req, res, next) => {
    const adminId = req.userId;
  
    const accessableMenu = await this.dataRepository.getMenuList(adminId);
    const accessPath = req.route.path.split("/")[1];
  
    const menu = accessableMenu.find((menu) => menu.path === accessPath);
  
    if (!menu) {
      return res.status(403).json({ message: "forbidden" });
    }
  
    next();
  };
}