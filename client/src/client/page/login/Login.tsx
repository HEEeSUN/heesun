import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useHistory } from "react-router";
import "./login.css";
import { Regex } from "../../model/model";
import { MemberService } from "../../model/member.model";
import Button from "../../components/Button";
import Input from "../../components/Input";
import KakaoLogin from "./components/KakaoLogin";

type Props = {
  memberService: MemberService;
  regex: Regex;
};

function Login({ memberService, regex }: Props) {
  let history = useHistory();
  let [username, setUsername] = useState<string>("");
  let [password, setPassword] = useState<string>("");
  let [kakao, setKakao] = useState<boolean>(false);

  const loginCheck = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!username || !regex.username.test(username)) {
      alert(`아이디를 확인해 주세요`);
      return false;
    }

    if (!password || password.length > 20) {
      alert(`비밀번호를 확인해 주세요`);
      return false;
    }

    const userInfo = {
      username,
      password,
    };

    try {
      await memberService.loginCheck(userInfo);

      history.push("/home");
    } catch (error: any) {
      alert(error.message);
    }
  };

  const settings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name;
    const value = event.target.value;

    switch (name) {
      case "username":
        setUsername(value);
        break;
      case "password":
        setPassword(value);
        break;
    }
  };

  useEffect(() => {
    if (kakao) {
      setKakao(false);
    }
  }, [kakao]);

  return (
    <form className="login" onSubmit={loginCheck}>
      <Input type="text" labelName="ID" name="username" settings={settings} />
      <Input
        type="password"
        labelName="PASSWORD"
        name="password"
        settings={settings}
      />
      <Button title={"Log In"} type={"submit"} />
      <Button
        title={"카카오로 로그인"}
        handleClickEvent={() => setKakao(true)}
      />
      <div className="login-signup-search">
        <Link to="/home/member/signup">
          <span className="login-signup">Sign Up</span>
        </Link>
        <Link to="/home/member/search">
          <span className="login-search">아이디/비밀번호 찾기</span>
        </Link>
      </div>
      {kakao && <KakaoLogin memberService={memberService} />}
    </form>
  );
}

export default Login;
