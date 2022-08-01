import { useHistory } from "react-router";

function NotFound() {
  let history = useHistory();

  return (
    <div>
      <p>페이지를 찾을 수 없습니다</p>
      <button className="goback-btn" onClick={() => history.goBack()}>
        이전페이지로 돌아가기
      </button>
    </div>
  );
}

export default NotFound;
