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
      <div className="chatting-time">{chat.createdAt}
      {
        chat.username==="master" &&
        <p className="chatting-time">
        {chat.uniqueId ? "안읽음" : "읽음"}
        </p>
      }
      </div>

    </div>
  );
}

export default Chatting;
