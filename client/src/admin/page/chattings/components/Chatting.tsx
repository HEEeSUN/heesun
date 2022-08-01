import { TempChat } from "../../../model/chatting.model";

type Props = {
  chat: TempChat;
  firstElement?: (node: any) => void;
};

function Chatting({ chat, firstElement }: Props) {
  return (
    <div
      ref={firstElement}
      className={chat.username === "master" ? "my-chatting" : "other-chatting"}
    >
      <div className="chatting-text">{chat.text}</div>
      <div className="chatting-time">{chat.createdAt}</div>
    </div>
  );
}

export default Chatting;
