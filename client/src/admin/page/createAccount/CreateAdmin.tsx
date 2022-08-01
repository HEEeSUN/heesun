import { useEffect, useState } from "react";
import "./createAccount.css";
import { Regex } from "../../model/model";
import { AdminService, Menu } from "../../model/admin.model";

type Props = {
  adminService: AdminService;
  menuList: Menu[];
  regex: Regex;
};

function CreateAdmin(props: Props) {
  let [admin, setAdmin] = useState<string>("");
  let [password, setPassword] = useState<string>("");
  let [selectedMenu, setSelectedMenu] = useState<string[]>([]);
  const { adminService, menuList, regex } = props;

  const createAdmin = async () => {
    if (selectedMenu.length < 1) {
      alert("1개 이상의 메뉴를 선택해 주세요");
      return;
    }

    if (
      !regex.password.test(password) ||
      password.length < 8 ||
      password.length > 20
    ) {
      alert(`비밀번호를 확인해 주세요`);
      return false;
    }

    if (!regex.admin.test(admin)) {
      alert(`아이디를 확인해 주세요`);
      return false;
    }

    try {
      await adminService.createAdmin(admin, password, selectedMenu);

      alert("새로운 관리자 계정이 생성되었습니다");
    } catch (error: any) {
      alert(error.message);
    }
  };

  const checked = (checked: boolean, value: string) => {
    let newArray = [...selectedMenu];

    if (checked) {
      newArray.push(value);
    } else {
      newArray = selectedMenu.filter((item) => item !== value);
    }

    setSelectedMenu(newArray);
  };

  useEffect(() => {
    const find = menuList.find((menu) => menu.menu === "홈");

    if (find) {
      setSelectedMenu((prevMenu) => [...prevMenu, String(find.menu_id)]);
    }
  }, []);

  return (
    <div className="create-account">
      <h5>관리자 계정 생성</h5>
      <hr />
      <input
        type="text"
        name="admin"
        placeholder="id"
        onChange={(e) => setAdmin(e.target.value)}
      ></input>
      <input
        type="password"
        name="password"
        placeholder="password"
        onChange={(e) => setPassword(e.target.value)}
      ></input>
      <hr />
      <p>해당 계정의 접근을 허용할 메뉴를 선택하여 주세요</p>
      <p>(해당 계정은 아래에서 선택된 메뉴에만 접근이 가능합니다)</p>
      <div className="menu-list">
        {menuList.map((menu, key) => {
          if (menu.menu !== "홈") {
            return (
              <div className="menu">
                <input
                  type="checkbox"
                  value={menu.menu_id}
                  onChange={(e) => checked(e.target.checked, e.target.value)}
                ></input>
                <span>{menu.menu}</span>
              </div>
            );
          } else {
            return (
              <div className="menu">
                <input type="checkbox" checked={true} disabled></input>
                <span>{menu.menu}</span>
              </div>
            );
          }
        })}
      </div>

      <button onClick={createAdmin}>계정생성</button>
    </div>
  );
}

export default CreateAdmin;
