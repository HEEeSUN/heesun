type Props = {
  showNotification: string;
  name: "id" | "password1" | "name" | "email" | "number" | "passwordCheck";
};

function SignupNotification(props: Props) {
  const message = {
    id: "8자 이상, 20자 이하의 영어 소문자, 대문자 및 숫자로 작성해 주세요",
    password1:
      "8자 이상, 20자 이하의 영어 소문자, 대문자, 숫자 및 특수문자로 작성해 주세요",
    name: "20자 이하의 영어 소문자, 대문자, 한글, 숫자로 구성",
    email: "아이디, 비밀번호 분실시 입력하신 이메일로 전송됩니다",
    number: "숫자로만 작성해 주세요",
    passwordCheck: "비밀번호를 확인해주세요",
  };

  const { showNotification, name } = props;

  return (
    <div className={showNotification === name ? "signup-rule" : "hidden"}>
      {message[name]}
    </div>
  );
}

export default SignupNotification;
