import { useState } from "react";
import "./contact.css";
import { ContactService } from "../../model/contact.model";
import { Regex } from "../../model/model";
import KakaoMap from "./components/Kakaomap";
import Button from "../../components/Button";

type Props = {
  contactService: ContactService;
  regex: Regex;
};

function Contact({ contactService, regex }: Props) {
  let [option, setOption] = useState<string>("email");
  let [content, setContent] = useState<string>("");
  let [name, setName] = useState<string>("");
  let [contactInformation, setContactInformation] = useState<string>("");

  const validator = () => {
    if (!name || !content || !option || !contactInformation) {
      alert("양식을 모두 기재해 주세요");
      return;
    } else if (name.length > 20) {
      alert("이름은 20자이하로 작성해 주세요");
      return;
    } else if (content.length > 500) {
      alert("내용은 500자 이하로 작성해 주세요");
      return;
    } else if (option === "phone" && !regex.number.test(contactInformation)) {
      alert("전화번호를 확인해 주세요");
      return;
    } else if (option === "email" && !regex.email.test(contactInformation)) {
      alert("이메일을 확인해 주세요");
      return;
    }

    return true;
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validator()) {
      return;
    }

    const inquiryInformation = {
      name,
      content,
      option,
      contactInformation,
      locking: false,
    };

    try {
      await contactService.writeInquiry(inquiryInformation);

      alert("문의가 등록되었습니다");
    } catch (error: any) {
      alert(error.message);
    }
  };

  const settings = async (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const target = event.target.name;
    const value = event.target.value;

    switch (target) {
      case "option":
        setOption(value);
        break;
      case "name":
        setName(value);
        break;
      case "contactInformation":
        setContactInformation(value);
        break;
      case "content":
        setContent(value);
        break;
    }
  };

  return (
    <div className="contact">
      <h1>CONTACT US</h1>
      <p>TEL: 010-1234-5678</p>
      <p>ADDRESS: 경기도 고양시 덕양구 00동</p>
      <div className="content">
        <form className="contact-form" onSubmit={submit}>
          <p>아래 양식을 작성해 주세요</p>
          <input
            className="info"
            type="text"
            name="name"
            onChange={settings}
            placeholder="이름"
          ></input>
          <fieldset>
            <input
              type="radio"
              name="option"
              value="email"
              defaultChecked={true}
              onChange={settings}
            ></input>
            <label>EMAIL</label>
            <input
              type="radio"
              name="option"
              value="phone"
              defaultChecked={false}
              onChange={settings}
            ></input>
            <label>PHONE</label>
          </fieldset>
          <input
            type="text"
            className="info"
            name="contactInformation"
            onChange={settings}
            placeholder={option}
          ></input>
          <textarea
            name="content"
            onChange={settings}
            placeholder="내용"
          ></textarea>
          <Button title="보내기" type="submit" extraClass="no-margin" />
        </form>
        <KakaoMap />
      </div>
    </div>
  );
}

export default Contact;
