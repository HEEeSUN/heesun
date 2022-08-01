import { createContext, useState } from "react";
import React, { ReactChildren, ReactChild } from "react";

interface AuxProps {
  children: ReactChild | ReactChildren;
}

type ISharedValue = {
  quantity: number;
  setCart: (quantity: number) => void;
  login: (username: string) => void;
  logout: () => void;
  loginState: boolean;
  username: string;
};

export let AuthContext: React.Context<ISharedValue>;

export function AuthProvider({ children }: AuxProps) {
  let [loginState, setLoginState] = useState<boolean>(false);
  let [quantity, setQuantity] = useState<number>(0);
  let [username, setUsername] = useState<string>("");

  const setCart = async (quantity: number) => {
    setQuantity(quantity);
  };

  const login = async (username: string) => {
    setUsername(username);
    setLoginState(true);
  };

  const logout = async () => {
    setUsername("");
    setLoginState(false);
  };

  const sharedValue: ISharedValue = {
    quantity,
    setCart,
    login,
    logout,
    loginState,
    username,
  };

  AuthContext = createContext(sharedValue);

  return (
    <AuthContext.Provider value={sharedValue}>{children}</AuthContext.Provider>
  );
}
