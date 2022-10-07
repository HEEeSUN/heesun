import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { UseParams } from "../model/model";
import { Menulist } from "../model/admin.model";

type Props = {
  menuList: Menulist[];
  logout: () => void;
};

function MenuList({ menuList, logout }: Props) {
  let [clickedMenu, setClickedMenu] = useState<number>(1);
  const path: string = useParams<UseParams>().id;

  return (
    <div className="adminMenuList">
      <ul>
        {menuList.map((menu, key) => {
          const pathStr = `/admin/${menu.path}`;
          return (
            <Link to={pathStr}>
              <li
                className={path === menu.path ? "clicked" : ""}
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
