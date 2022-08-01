import { useState } from "react";
import { MemberService } from "../../../model/member.model";
import Button from "../../../components/Button";
import Input from "../../../components/Input";

type Props = {
  memberService: MemberService;
};

function SearchPw({ memberService }: Props) {
  let [id, setId] = useState<string>("");
  let [email, setEmail] = useState<string>("");
  let [done, setDone] = useState<boolean>(false);
  let [loading, setLoading] = useState<boolean>(false);

  const searchPw = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setLoading(true);

      const userInfo = {
        id,
        email,
      };
      await memberService.findPassword(userInfo);

      setLoading(false);
      setDone(true);
    } catch (error: any) {
      setLoading(false);
      alert(error.message);
    }
  };

  const settings = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name;
    const value = event.target.value;

    switch (name) {
      case "id":
        setId(value);
        break;
      case "email":
        setEmail(value);
        break;
    }
  };

  return !done ? (
    <form className="search-form" onSubmit={searchPw}>
      <Input type="text" name="id" labelName="ID *" settings={settings} />
      <Input type="text" name="email" labelName="EMAIL *" settings={settings} />
      {loading ? (
        <img className="loading" src="../image/loading.png" alt="loading"></img>
      ) : (
        <Button title={"다음"} type={"submit"} />
      )}
    </form>
  ) : (
    <div className="search-form">email로 전송되었습니다</div>
  );
}

export default SearchPw;
