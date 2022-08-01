import { TempChatting, TempChattingCheck } from "../../../model/chatting.model";

type Props = {
  chat: TempChatting | TempChattingCheck;
  firstElement?: (node: any) => void;
};
function Chatting({ chat, firstElement }: Props) {
  return (
    <div
      ref={firstElement}
      className={chat.username === "master" ? "otherschat" : "mychat"}
    >
      <p className="chatting-text">{chat.text}</p>
      <p className="chatting-time">
        {chat.createdAt ? chat.createdAt : "전송중"}
      </p>
    </div>
  );
}

export default Chatting;
