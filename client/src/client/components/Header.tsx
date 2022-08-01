import { Link } from "react-router-dom";
import Search from "./Search";

type Props = {
  logout: () => void;
  loginState: boolean;
  quantityInCart: number;
  searchWord: string;
  setSearchWord: React.Dispatch<React.SetStateAction<string>>;
};

function Header(props: Props) {
  let { logout, loginState, quantityInCart, searchWord, setSearchWord } = props;

  return (
    <header>
      <div className="headerTop">
        <div className="headerLeft">
          <Link to="/home" className="text">
            <span>HEESUN</span>
          </Link>
        </div>
        <div className="headerCenter">
          <ul className="category">
            <li>
              <Link to="/home" className="text">
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link
                to="/home/shop"
                className="text"
                onClick={() => setSearchWord("")}
              >
                <span>Shop</span>
              </Link>
            </li>
            <li>
              <Link to="/home/community" className="text">
                <span>Community</span>
              </Link>
            </li>
            <li>
              <Search searchWord={searchWord} setSearchWord={setSearchWord} />
            </li>
          </ul>
        </div>
        <div className="headerRight">
          {loginState ? (
            <div>
              <Link to="/home/member/info">
                <span>Info</span>
              </Link>
              <Link to="/home/member/cart">
                <span>Cart({quantityInCart})</span>
              </Link>
              <span onClick={logout}>logout</span>
            </div>
          ) : (
            <Link to="/home/member/login">
              <span>Log In</span>
            </Link>
          )}
        </div>
      </div>
      <div className="headerBottom">
        <ul className="category">
          <li>
            <Link to="/home" className="text">
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link to="/home/shop" className="text">
              <span>Shop</span>
            </Link>
          </li>
          <li>
            <Link to="/home/community" className="text">
              <span>Community</span>
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}

export default Header;
