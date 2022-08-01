export const regex = {
  admin: /^[0-9a-zA-Z]{1,20}$/,
  username: /^[0-9a-zA-Z]{6,20}$/,
  password: /[0-9a-zA-Z]{1,}[^0-9a-zA-Z]{1,}/,
  name: /^[0-9a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣]{1,20}$/,
  number: /^[0-9]{9,12}$/,
  email:
    /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/,
};
