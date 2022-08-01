import { useState } from "react";
import "./searchUser.css";
import { MemberService } from "../../model/member.model";
import SearchId from "./components/SearchId";
import SearchPw from "./components/SearchPw";

type Props = {
  memberService: MemberService;
};

function SearchUser({ memberService }: Props) {
  let [searchThing, setSearchThing] = useState<"id" | "pw">("id");

  return (
    <div className="search-userinfo">
      <div className="menulist">
        <div
          className={`menu ${searchThing === "id" ? "clicked-menu" : null}`}
          onClick={() => setSearchThing("id")}
        >
          ID 찾기
        </div>
        <div
          className={`menu ${searchThing === "pw" ? "clicked-menu" : null}`}
          onClick={() => setSearchThing("pw")}
        >
          비밀번호 찾기
        </div>
      </div>
      <div className="content">
        {searchThing === "id" ? (
          <SearchId memberService={memberService} />
        ) : (
          <SearchPw memberService={memberService} />
        )}
      </div>
    </div>
  );
}

export default SearchUser;
