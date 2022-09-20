import { Route } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { Switch, useHistory } from "react-router";
import "./ClientHome.css";
import { initSocket } from "./service/socket";
import { AuthContext } from "../context/authcontext";
import { Regex, SharedValue } from "./model/model";
import { ChattingService } from "./model/chatting.model";
import { CommunityService } from "./model/community.model";
import { MemberService } from "./model/member.model";
import { ProductService } from "./model/product.model";
import Signup from "./page/signup/Signup";
import Login from "./page/login/Login";
import SearchUser from "./page/search/SearchUser";
import Home from "./page/home/Home";
import Shop from "./page/shop/Shop";
import SearchProducts from "./page/SearchProducts";
import Product from "./page/product/Product";
import Community from "./page/community/Community";
import Post from "./page/post/Post";
import ChattingList from "./page/chatting/ChattingList";
import Member from "./page/Member";
import Header from "./components/Header";
import Footer from "./components/Footer";
import InquiryButton from "./components/InquiryButton";
import AuthError from "./components/AuthError";
import NotFound from "./components/NotFound";

type Props = {
  productService: ProductService;
  memberService: MemberService;
  communityService: CommunityService;
  chattingService: ChattingService;
  regex: Regex;
};

function ClientHome(props: Props) {
  let [socketId, setSocketId] = useState<string>("");
  let [socketEvent, setSocketEvent] = useState<string>("");
  let [chatting, setChatting] = useState<boolean>(false);
  let [quantityInCart, setQuantityInCart] = useState<number>(0);
  let [searchWord, setSearchWord] = useState<string>("");
  const sharedValue: SharedValue = useContext(AuthContext);
  const { loginState, username } = sharedValue;
  const {
    productService,
    memberService,
    communityService,
    chattingService,
    regex,
  } = props;
  const histroy = useHistory();

  const socketCallback = async (event: string) => {
    setSocketEvent(event);
  };

  const setInitialSocketId = async (id: string) => {
    setSocketId(id);
  };

  const handleCartQuantity = (quantity: number) => {
    setQuantityInCart(quantity);
  };

  const logout = async () => {
    if (window.Kakao.isInitialized()) {
      if (window.Kakao.Auth.getAccessToken()) {
        window.Kakao.Auth.logout();
      }
    }

    await memberService.logoff();
    histroy.push("/home");
  };

  const showChattingList = () => {
    setChatting(true);
  };

  const closeChattingList = () => {
    setChatting(false);
  };

  useEffect(() => {
    if (!loginState)
      memberService.auth(handleCartQuantity);
    initSocket(chattingService, setInitialSocketId, socketCallback);
  }, []);

  return (
    <div className="ClientHome">
      <Header
        logout={logout}
        loginState={loginState}
        quantityInCart={quantityInCart}
        searchWord={searchWord}
        setSearchWord={setSearchWord}
      />
      <section>
        {chatting && (
          <ChattingList
            chattingService={chattingService}
            loginState={loginState}
            logout={logout}
            socketId={socketId}
            socketEvent={socketEvent}
            setSocketEvent={setSocketEvent}
            closeChattingList={closeChattingList}
            username={username}
          />
        )}
        <Switch>
          <Route exact path="/home">
            <Home productService={productService} />
            <InquiryButton showChattingList={showChattingList} />
          </Route>
          <Route exact path="/home/shop">
            <Shop productService={productService} />
            <InquiryButton showChattingList={showChattingList} />
          </Route>
          <Route exact path="/home/shop/:id">
            <SearchProducts
              productService={productService}
              searchWord={searchWord}
            />
            <InquiryButton showChattingList={showChattingList} />
          </Route>
          <Route exact path="/home/product/:id">
            <Product
              productService={productService}
              loginState={loginState}
              setQuantityInCart={setQuantityInCart}
            />
            <InquiryButton showChattingList={showChattingList} />
          </Route>
          <Route exact path="/home/member/signup">
            <Signup memberService={memberService} regex={regex} />
          </Route>
          <Route exact path="/home/member/search">
            <SearchUser memberService={memberService} />
          </Route>
          <Route exact path="/home/member/login">
            <Login memberService={memberService} regex={regex} />
          </Route>
          <Route path="/home/member">
            {!loginState ? (
              <AuthError />
            ) : (
              <Member
                memberService={memberService}
                setQuantityInCart={setQuantityInCart}
                regex={regex}
              />
            )}
          </Route>
          <Route exact path="/home/community">
            <Community
              communityService={communityService}
              loginState={loginState}
            />
          </Route>
          <Route exact path="/home/community/:id">
            <Post communityService={communityService} username={username} />
          </Route>
          <Route path="*">
            <NotFound />
          </Route>
        </Switch>
      </section>
      <Footer />
    </div>
  );
}

export default ClientHome;
