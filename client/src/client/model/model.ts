export type UseParams = {
  id: string;
};

export type Regex = {
  username: RegExp;
  password: RegExp;
  name: RegExp;
  number: RegExp;
  email: RegExp;
};

export type SharedValue = {
  login: (username: string) => void;
  logout: () => void;
  loginState: boolean;
  username: string;
};
