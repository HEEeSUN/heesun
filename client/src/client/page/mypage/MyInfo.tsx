import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { Regex } from "../../model/model";
import { MemberService, UserInfo } from "../../model/member.model";
import PostcodePopup from "../../components/PostcodePopup";
import Input from "../../components/Input";
import SignupNotification from "../signup/components/SignupNotification";
import Button from "../../components/Button";

type Props = {
  memberService: MemberService;
  regex: Regex;
};

function MyInfo({ memberService, regex }: Props) {
  let [userInfo, setUserInfo] = useState<UserInfo>();
  let [username, setUsername] = useState<string>("");

  let [newUserInfo, setNewUserInfo] = useState<UserInfo>();
  let [newName, setNewName] = useState<string>("");
  let [newPhone, setNewPhone] = useState<string>("");
  let [newAddress, setNewAddress] = useState<string>("");
  let [newExtraAddress, setNewExtraAddress] = useState<string>("");
  let [changePassword, setChangePassword] = useState<boolean>(false);
  let [newPassword1, setNewPassword1] = useState<string>("");
  let [newPassword2, setNewPassword2] = useState<string>("");
  let [newEmail, setNewEmail] = useState<string>("");
  let [checkPw, setCheckPw] = useState<boolean>(true);
  let [showPostcodePopup, setShowPostcodePopup] = useState<boolean>(false);
  let [address, setAddress] = useState<string>("");

  let history = useHistory();

  const getUserInfo = async () => {
    const { userInfo } = await memberService.getUserInfo();

    console.log(userInfo);
    setUserInfo(userInfo);
    setNewUserInfo(userInfo);
  };

  function matchedPassword() {
    if (newPassword1 !== newPassword2) {
      setCheckPw(false);
    } else {
      setCheckPw(true);
    }
  }

  const check = async () => {
    if (!regex.name.test(newName)) {
      alert(`이름을 확인해 주세요`);
      return false;
    }

    if (newAddress.length > 100 || newExtraAddress.length > 100) {
      alert(`주소를 확인해 주세요`);
      return;
    }

    if (!regex.number.test(newPhone)) {
      alert(`전화번호를 확인해 주세요`);
      return false;
    }

    if (!regex.email.test(newEmail)) {
      alert(`이메일을 확인해 주세요`);
      return false;
    }

    if (changePassword && checkPw) {
      if (
        !regex.password.test(newPassword1) ||
        newPassword1.length < 8 ||
        newPassword1.length > 20
      ) {
        alert(`비밀번호를 확인해 주세요`);
        return false;
      }
    } else if (changePassword && !checkPw) {
      alert(`비밀번호를 확인해 주세요`);
      return false;
    }

    return true;
  };

  const modifyUserinfo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      if (
        JSON.stringify(userInfo) !== JSON.stringify(newUserInfo) ||
        changePassword
      ) {
        const validation = await check();

        if (!validation) {
          return;
        }

        const changeInfo = {
          ...newUserInfo,
          password: newPassword1,
        };

        await memberService.modifyUserinfo(changeInfo);

        alert("변경되었습니다");
      } else {
        alert("변경사항이 없습니다");
      }

      history.push("info");
    } catch (error: any) {
      alert(error.message);
    }
  };

  const settings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name;
    const value = event.target.value;

    switch (name) {
      case "name":
        setNewName(value);
        break;
      case "number":
        setNewPhone(value);
        break;
      case "extraAddress":
        setNewExtraAddress(value);
        break;
      case "password1":
        setNewPassword1(value);
        break;
      case "password2":
        setNewPassword2(value);
        break;
      case "email":
        setNewEmail(value);
        break;
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  useEffect(() => {
    setNewAddress(address);
  }, [address]);

  useEffect(() => {
    matchedPassword();
  }, [newPassword1, newPassword2]);

  useEffect(() => {
    if (userInfo) {
      setUsername(userInfo.username);
      setNewName(userInfo.name);
      setNewPhone(userInfo.phone);
      setNewEmail(userInfo.email);
      setNewAddress(userInfo.address);
      setNewExtraAddress(userInfo.extra_address);
    }
  }, [userInfo]);

  useEffect(() => {
    setNewUserInfo({
      username: username,
      name: newName,
      phone: newPhone,
      email: newEmail,
      address: newAddress,
      extra_address: newExtraAddress,
    });
  }, [newName, newPhone, newAddress, newExtraAddress, newEmail]);

  return (
    <div className="signup">
      <form className="signup-form" onSubmit={modifyUserinfo}>
        <div className="notification">
          <p>MY INFOMRMATION</p>
        </div>
        <Input
          type="text"
          name="id"
          labelName="ID"
          value={username}
          settings={settings}
          disabled={true}
        />
        {!changePassword ? (
          <div className="common-input">
            <label className="common-label">PASSWORD</label>
            <Button
              title="비밀번호변경"
              type="button"
              handleClickEvent={() => setChangePassword(true)}
            />
          </div>
        ) : (
          <>
            <Input
              type="password"
              name="password1"
              labelName="PASSWORD"
              settings={settings}
            />
            <Input
              type="password"
              name="password2"
              labelName="PASSWORD 확인"
              settings={settings}
            />
            <SignupNotification
              showNotification={!checkPw ? "passwordCheck" : ""}
              name="passwordCheck"
            />
          </>
        )}
        <Input
          type="text"
          name="name"
          labelName="NAME"
          value={newName}
          settings={settings}
        />
        <Input
          type="text"
          name="number"
          labelName="PHONE"
          value={newPhone}
          settings={settings}
        />
        <Input
          type="text"
          name="email"
          labelName="EMAIL"
          value={newEmail}
          settings={settings}
        />
        <div style={{ display: "flex" }}>
          <Input
            type="text"
            name="address"
            labelName="ADDRESS"
            value={newAddress}
            settings={settings}
            placeholder={"주소찾기를 이용해주세요"}
            disabled={true}
          />
          <Button
            title="주소찾기"
            type="button"
            handleClickEvent={() => setShowPostcodePopup(true)}
          />
        </div>
        <Input
          type="text"
          name="extraAddress"
          labelName=""
          value={newExtraAddress}
          settings={settings}
        />
        <Button title="수정완료" type="submit" />
      </form>
      {showPostcodePopup ? (
        <PostcodePopup
          setAddress={setAddress}
          setShowPostcodePopup={setShowPostcodePopup}
        />
      ) : null}
    </div>
  );
}

export default MyInfo;
