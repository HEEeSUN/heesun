import { useHistory } from "react-router";

function AuthError() {
  let history = useHistory();

  return (
    <div>
      <p>로그인 정보를 확인해주세요</p>
      <button className="goback-btn" onClick={() => history.push("/")}>
        홈으로
      </button>
    </div>
  );
}

export default AuthError;
