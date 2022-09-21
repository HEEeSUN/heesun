import { createContext, useState } from "react";
import React, { ReactChildren, ReactChild } from "react";
import { Menulist } from "../admin/model/admin.model";
import MenuList from "../admin/components/MenuList";

interface AuxProps {
  children: ReactChild | ReactChildren;
}

type ISharedValue = {
  quantity: number;
  login: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  expiredSession: () => Promise<void>;
  setCart: (quantity: number) => void;
  setMenus: (menuList: Menulist[]) => Promise<void>;
  loginState: boolean;
  sessionState: boolean;
  username: string;
  menuList: Menulist[];
};

export let AuthContext: React.Context<ISharedValue>;

export function AuthProvider({ children }: AuxProps) {
  let [loginState, setLoginState] = useState<boolean>(false);
  let [quantity, setQuantity] = useState<number>(0);
  let [username, setUsername] = useState<string>("");
  let [sessionState, setSessionState] = useState<boolean>(false);
  let [menuList, setMenuList] = useState<Menulist[]>([]);

  const setCart = async (quantity: number) => {
    setQuantity(quantity);
  };

  const setMenus = async (menulist: Menulist[]) => {
    setMenuList(menulist);
  }

  const login = async (username: string) => {
    setUsername(username);
    setLoginState(true);
    setSessionState(true)
  };

  const logout = async () => {
    setUsername("");
    setLoginState(false);
  };

  const expiredSession = async () => {
    setSessionState(false);
  }

  const sharedValue: ISharedValue = {
    quantity,
    login,
    logout,
    expiredSession,
    setCart,
    setMenus, 
    loginState,
    sessionState,
    username,
    menuList,
  };

  AuthContext = createContext(sharedValue);

  return (
    <AuthContext.Provider value={sharedValue}>{children}</AuthContext.Provider>
  );
}
