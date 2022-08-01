import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminService, Menulist } from "../model/admin.model";

type Props = {
  adminService: AdminService;
  menuList: Menulist[];
  setMenuList: React.Dispatch<React.SetStateAction<Menulist[]>>;
  logout: () => void;
};

function MenuList({ adminService, menuList, setMenuList, logout }: Props) {
  let [clickedMenu, setClickedMenu] = useState<number>(1);

  const getMenuList = async () => {
    try {
      const { menuList } = await adminService.getMenuList();

      setMenuList(menuList);
    } catch (error: any) {
      alert(error.message);
    }
  };

  useEffect(() => {
    getMenuList();
  }, []);

  return (
    <div className="adminMenuList">
      <ul>
        {menuList.map((menu, key) => {
          const pathStr = `/admin/${menu.path}`;
          return (
            <Link to={pathStr}>
              <li
                className={clickedMenu === key + 1 ? "clicked" : ""}
                onClick={() => setClickedMenu(key + 1)}
              >
                {menu.menu}
              </li>
            </Link>
          );
        })}
        <li
          className={clickedMenu === menuList.length + 1 ? "clicked" : ""}
          onClick={logout}
        >
          로그아웃
        </li>
      </ul>
    </div>
  );
}

export default MenuList;
