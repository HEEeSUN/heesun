import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import "./signup.css";
import { Regex } from "../../model/model";
import { MemberService } from "../../model/member.model";
import SignupNotification from "./components/SignupNotification";
import PostcodePopup from "../../components/PostcodePopup";
import Alert from "../../components/Alert";
import Button from "../../components/Button";
import Input from "../../components/Input";

type Props = {
  memberService: MemberService;
  regex: Regex;
};

function Signup(props: Props) {
  let [signId, setSignId] = useState<string>("");
  let [signPw1st, setSignPw1st] = useState<string>("");
  let [signPw2nd, setSignPw2nd] = useState<string>("");
  let [signName, setSignName] = useState<string>("");
  let [email, setEmail] = useState<string>("");
  let [checkPw, setCheckPw] = useState<boolean>(true);
  let [showModal, setShowModal] = useState<boolean>(false);
  let [exclusiveId, setExclusiveId] = useState<boolean>(false);
  let [showPostcodePopup, setShowPostcodePopup] = useState<boolean>(false);
  let [number, setNumber] = useState<string>("");
  let [address, setAddress] = useState<string>("");
  let [extraAddress, setExtraAddress] = useState<string>("");
  let [showNotification, setShowNotification] = useState<string>("");
  let history = useHistory();
  const { memberService, regex } = props;

  /* id 중복 체크 */
  const checkDuplicate = async () => {
    const validation: boolean = validationCheckForDuplicate();

    if (!validation) {
      return;
    }

    try {
      await memberService.checkDuplicate(signId);

      setExclusiveId(true);
      alert("사용가능한 아이디입니다");
    } catch (error: any) {
      alert(error.message);
    }
  };

  /* 회원가입 */
  const signup = async () => {
    const validation: boolean = validationCheckForSignup();

    if (!validation) {
      return;
    }

    const signupInfo = {
      username: signId,
      password: signPw1st,
      name: signName,
      email,
      phone: number,
      address: address,
      extra_address: extraAddress,
    };

    try {
      await memberService.signup(signupInfo);

      setShowModal(true);
    } catch (error: any) {
      alert(error.message);
    }
  };

  /* 아이디 중복체크시 아이디가 제대로 입력되었는지 검증 */
  const validationCheckForDuplicate = (): boolean => {
    if (!signId || !regex.username.test(signId)) {
      alert(`아이디를 확인해 주세요`);
      return false;
    }

    return true;
  };

  /* 회원가입시 모든 내용이 제대로 입력되었는지 검증 */
  const validationCheckForSignup = (): boolean => {
    if (!exclusiveId) {
      alert("아이디 중복확인을 해주세요");
      return false;
    }

    if (!signPw1st || !signPw2nd || !signName || !number) {
      alert("필수입력사항을 모두 입력해주세요.");
      return false;
    }

    if (
      signPw1st === "" ||
      checkPw === false ||
      !regex.password.test(signPw1st) ||
      signPw1st.length < 8 ||
      signPw1st.length > 20
    ) {
      alert(`비밀번호를 확인해 주세요`);
      return false;
    }
    if (!regex.name.test(signName)) {
      alert(`이름을 확인해 주세요`);
      return false;
    }

    if (!regex.number.test(number)) {
      alert(`전화번호를 확인해 주세요`);
      return false;
    }

    if (!regex.email.test(email)) {
      alert(`이메일을 확인해 주세요`);
      return false;
    }

    if (extraAddress.length > 100 || address.length > 100) {
      alert(`주소를 확인해 주세요`);
      return false;
    }

    return true;
  };

  /* 2개의 패스워드 입력창의 내용이 동일한지 검증*/
  function matchedPassword() {
    if (signPw1st !== signPw2nd) {
      setCheckPw(false);
    } else {
      setCheckPw(true);
    }
  }

  const settings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value: string | number = event.target.value;
    const targetName: string = event.target.name;

    switch (targetName) {
      case "id":
        setSignId(value);
        setExclusiveId(false);
        break;
      case "password1":
        setSignPw1st(value);
        break;
      case "password2":
        setSignPw2nd(value);
        break;
      case "name":
        setSignName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "number":
        setNumber(value);
        break;
      case "extraAddress":
        setExtraAddress(value);
        break;
    }
  };

  const handleClose = () => {
    setShowModal(false);
    history.push("/home");
  };

  /* 모달창 닫기 및 로그인페이지 이동*/
  const handleMoveToLogin = () => {
    setShowModal(false);
    history.push("/home/member/login");
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement, Element>) => {
    const targetName: string = event.target.name;

    setShowNotification(targetName);
  };

  const handleBlur = () => {
    setShowNotification("");
  };

  useEffect(() => {
    matchedPassword();
  }, [signPw1st, signPw2nd]);

  return (
    <div className="signup">
      <form className="signup-form" onSubmit={signup}>
        <div className="notification">
          <p>REGISTER TO CREATE AN ACCOUNT</p>
          <p>* 표시가 되어있는 항목은 필수입력사항입니다.</p>
        </div>
        <div className="signup-item-with-btn">
          <div className="signup-item">
            <Input
              type="text"
              name="id"
              labelName="ID *"
              settings={settings}
              handleFocus={handleFocus}
              handleBlur={handleBlur}
            />
            <SignupNotification showNotification={showNotification} name="id" />
          </div>
          {exclusiveId ? (
            <div>확인완료</div>
          ) : (
            <Button title={"중복확인"} handleClickEvent={checkDuplicate} />
          )}
        </div>
        <div className="signup-item">
          <Input
            type="password"
            name="password1"
            labelName="PASSWORD *"
            settings={settings}
            handleFocus={handleFocus}
            handleBlur={handleBlur}
          />
          <SignupNotification
            showNotification={showNotification}
            name="password1"
          />
        </div>
        <div className="signup-item">
          <Input
            type="password"
            name="password2"
            labelName="PASSWORD 확인 *"
            settings={settings}
            handleFocus={handleFocus}
            handleBlur={handleBlur}
          />
          <SignupNotification
            showNotification={!checkPw ? "passwordCheck" : ""}
            name="passwordCheck"
          />
        </div>
        <div className="signup-item">
          <Input
            type="text"
            name="name"
            labelName="NAME *"
            settings={settings}
            handleFocus={handleFocus}
            handleBlur={handleBlur}
          />
          <SignupNotification showNotification={showNotification} name="name" />
        </div>
        <div className="signup-item">
          <Input
            type="text"
            name="number"
            labelName="PHONE *"
            settings={settings}
            handleFocus={handleFocus}
            handleBlur={handleBlur}
          />
          <SignupNotification
            showNotification={showNotification}
            name="number"
          />
        </div>
        <div className="signup-item">
          <Input
            type="text"
            name="email"
            labelName="EMAIL *"
            settings={settings}
            handleFocus={handleFocus}
            handleBlur={handleBlur}
          />
          <SignupNotification
            showNotification={showNotification}
            name="email"
          />
        </div>
        <div className="signup-item-with-btn">
          <div className="signup-item">
            <Input
              type="text"
              name="address"
              labelName="ADDRESS"
              settings={settings}
              handleFocus={handleFocus}
              handleBlur={handleBlur}
              placeholder={"주소찾기를 이용해주세요"}
              disabled={true}
              value={address}
            />
          </div>
          <Button
            title={"주소찾기"}
            handleClickEvent={() => setShowPostcodePopup(true)}
          />
        </div>
        <div className="signup-item">
          <Input
            type="text"
            name="extraAddress"
            labelName=""
            settings={settings}
            handleFocus={handleFocus}
            handleBlur={handleBlur}
            placeholder={"상세주소를 입력해주세요"}
          />
        </div>
        {showPostcodePopup && (
          <PostcodePopup
            setAddress={setAddress}
            setShowPostcodePopup={setShowPostcodePopup}
          />
        )}
        <Button
          title={"SignUp"}
          extraClass={"big-size-btn"}
          handleClickEvent={signup}
        />
        {showModal && (
          <Alert
            showModal={showModal}
            handleClose={handleClose}
            handleMove={handleMoveToLogin}
            titleTxt={"회원가입 완료"}
            bodyTxt={
              "회원가입이 완료되었습니다. 로그인화면으로 이동하시겠습니까?"
            }
          />
        )}
      </form>
    </div>
  );
}

export default Signup;
