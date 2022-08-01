import { useState } from "react";
import "./login.css";
import { AdminService } from "../../model/admin.model";

type Props = {
  adminService: AdminService;
};

function Login({ adminService }: Props) {
  let [admin, setAdmin] = useState<string>("");
  let [password, setPassword] = useState<string>("");

  /* 로그인 */
  const adminLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (admin === "" || password === "") {
      alert("아이디와 비밀번호를 확인해주세요");
    } else {
      try {
        await adminService.adminLogin(admin, password);
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  return (
    <form className="login-form" onSubmit={adminLogin}>
      <p>Admin LogIn</p>
      <input
        type="text"
        name="admin"
        placeholder="admin"
        onChange={(e) => setAdmin(e.target.value.trim())}
      ></input>
      <input
        type="password"
        name="password"
        placeholder="password"
        onChange={(e) => setPassword(e.target.value.trim())}
      ></input>
      <button type="submit">Log in</button>
    </form>
  );
}

export default Login;
