export type AdminService = {
  adminLogin: (admin: string, password: string) => Promise<void>;
  getMenuList: () => Promise<{
    menuList: Menulist[] | [];
  }>;
  logoff: () => Promise<void>;
  auth: () => Promise<void>;
  createAdmin: (
    admin: string,
    password: string,
    menuList: string[]
  ) => Promise<void>;
};

export type Menulist = {
  menu_id: number;
  admin_id: number;
  menu: string;
  path: string;
};

export type Menu = {
  menu_id: number;
  admin_id: number;
  menu: string;
  path: string;
};
