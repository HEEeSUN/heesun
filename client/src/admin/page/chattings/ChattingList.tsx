import { useEffect, useState } from "react";
import "./chattings.css";
import Chattings from "./components/Chattings";
import { parseDate } from "../../util/date";
import * as socketService from "../../service/socket";
import {
  AdminChattingService,
  Chat,
  SocketEvent,
} from "../../model/chatting.model";

type Props = {
  adminChattingService: AdminChattingService;
};

function ChattingList({ adminChattingService }: Props) {
  const chattingUser = "master";
  let [socketId, setSocketId] = useState<string>("");
  let [chatRoomName, setChatRoomName] = useState<string>("");
  let [privateChat, setPrivatechat] = useState<boolean>(false);
  let [clickedChat, setClickedChat] = useState<string>("");
  let [socketEvent, setSocketEvent] = useState<SocketEvent>("");
  let [privateSocketEvent, setPrivateSocketEvent] = useState<string>("");
  let [chatList, setChatList] = useState<Chat[]>([]);
  let [chattingStatus, setChattingStatus] = useState<boolean>(true);
  const { joinRoom, leaveRoom, sendMessage, getChatting, getNewChatting } =
    socketService;

  const socket = {
    joinRoom,
    leaveRoom,
    sendMessage,
    getChatting,
    getNewChatting,
  };

  const modifyDate = async (chatList: Chat[]) => {
    const newChatList = await parseDate(chatList);
    setChatList(newChatList);
  };

  const setInitialSocketId = async (socketId: string) => {
    setSocketId(socketId);
  };

  /* 소켓 이벤트 발생시 소켓 이벤트 변경 (소켓 클래스의 콜백함수로 전달)*/
  const socketEventOccur = async (socketEventData: SocketEvent) => {
    setSocketEvent(socketEventData);
  };

  /* 전체 채팅 리스트 가져오기 */
  const getInquiry = async () => {
    try {
      const { chatList } = await adminChattingService.getInquiry(
        socketId,
        chattingUser
      );

      await modifyDate(chatList);
    } catch (error: any) {
      alert(error.message);
    }
  };

  /* socketEvent state가 변경될 경우 어떠한 이벤트가 발생한 것인지 확인 및 해당 이벤트에 해당하는 행위 실행
   현재 컴포넌트에서는 newMessage  이벤트가 발생할 시에만 변동이 있고, 나머지 이벤트는 모두
   개인 채팅방에 해당하는 이벤트이기 때문에 개인채팅방이 알수있도록 privateSocketEvent state를 변경*/
  const socketEventProcess = async () => {
    if (socketEvent === "updateChatList") {
      getInquiry();
    } else {
      setPrivateSocketEvent(socketEvent);
    }
    setSocketEvent("");
  };

  /* 채팅방 리스트 중 하나를 더블 클릭시 join 발생 */
  const joinChatRoom = async (chat: Chat) => {
    if (privateChat) {
      await leavePrevRoom();
    }
    setChattingStatus(chat.status);
    setChatRoomName(chat.room_name);
    setPrivatechat(true);
    setClickedChat(chat.room_name);
  };

  const leavePrevRoom = async () => {
    setPrivatechat(false);
    socketService.leaveRoom(chatRoomName);
  };

  useEffect(() => {
    if (socketEvent) socketEventProcess();
  }, [socketEvent]);

  useEffect(() => {
    socketService.initSocket(
      socketEventOccur,
      setInitialSocketId,
      adminChattingService
    );
  }, []);

  useEffect(() => {
    if (socketId) getInquiry();
  }, [socketId]);

  useEffect(() => {
    getInquiry();
    if (!privateChat) {
      // getInquiry();
      setClickedChat("");
    }
  }, [privateChat]);

  return (
    <>
      <div className="chatting-list">
        {!chatList[0] ? (
          <span>아직 문의사항이 없습니다</span>
        ) : (
          chatList.map((chat, key) => {
            return (
              <div
                key={key}
                className={`chatting-summary ${
                  clickedChat === chat.room_name ? "clicked-chatting" : ""
                }`}
                onDoubleClick={() => joinChatRoom(chat)}
              >
                <div className="chatting-summary-left">
                  <div className="chatting-username">
                    {chat.member ? "회원 ID : " + chat.username : "비회원"}
                    {!chat.status ? " <삭제된채팅>" : ""}
                  </div>
                  <div className="chatting-text">{chat.lastChat}</div>
                </div>
                <div className="chatting-badge">
                  <p className="chatting-badge-time">{chat.chatTime}</p>
                  {chat.noReadMsg ? (
                    <div className="circle">{chat.noReadMsg}</div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
      {privateChat ? (
        <Chattings
          adminChattingService={adminChattingService}
          socketEventOccur={socketEventOccur}
          socketService={socket}
          privateSocketEvent={privateSocketEvent}
          setPrivateSocketEvent={setPrivateSocketEvent}
          setPrivatechat={setPrivatechat}
          chatRoomName={chatRoomName}
          chattingStatus={chattingStatus}
        />
      ) : (
        <div className="chatting-wrapper">채팅방을 선택해주세요</div>
      )}
    </>
  );
}

export default ChattingList;
