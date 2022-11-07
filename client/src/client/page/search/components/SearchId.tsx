import { useState } from "react";
import { MemberService } from "../../../model/member.model";
import Button from "../../../components/Button";
import Input from "../../../components/Input";

type Props = {
  memberService: MemberService;
};

function SearchId({ memberService }: Props) {
  let [name, setName] = useState<string>("");
  let [email, setEmail] = useState<string>("");
  let [done, setDone] = useState<boolean>(false);
  let [loading, setLoading] = useState<boolean>(false);

  const searchId = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);

    try {
      const userInfo = {
        username: name,
        email,
      };

      await memberService.findId(userInfo);

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
      case "name":
        setName(value);
        break;
      case "email":
        setEmail(value);
        break;
    }
  };

  return !done ? (
    <form className="search-form" onSubmit={searchId}>
      <Input type="text" name="name" labelName="NAME *" settings={settings} />
      <Input type="text" name="email" labelName="EMAIL *" settings={settings} />
      {loading ? (
        <img className="loading" src="/image/loading.png" alt="loading"></img>
      ) : (
        <Button title={"다음"} type={"submit"} />
      )}
    </form>
  ) : (
    <div className="search-form">email로 전송되었습니다</div>
  );
}

export default SearchId;
