import { useEffect, useState } from "react";
import { parseDate } from "../../util/date";
import { ChattingService, Chat } from "../../model/chatting.model";
import Chatting from "./Chattings";
import CloseButton from "../../components/CloseButton";
import { leaveRoom } from "../../service/socket";

type Props = {
  chattingService: ChattingService;
  loginState: boolean;
  logout: () => void;
  socketId: string;
  socketEvent: string;
  setSocketEvent: React.Dispatch<React.SetStateAction<string>>;
  closeChattingList: () => void;
  username: string;
};

function ChattingList(props: Props) {
  let [chatList, setChatList] = useState<Chat[]>([]);
  let [roomName, setRoomName] = useState<string>("");
  let [joinRoom, setJoinRoom] = useState<boolean>(false);
  let [newRoom, setNewRoom] = useState<boolean>(false);
  const {
    chattingService,
    loginState,
    logout,
    socketId,
    socketEvent,
    setSocketEvent,
    closeChattingList,
    username,
  } = props;

  const modifyDate = async (chatList: Chat[]) => {
    const newChatList = await parseDate(chatList);
    setChatList(newChatList);
  };

  /* 전체 채팅 리스트 가져오기 */
  const getChattings = async () => {
    try {
      let result;

      if (!username) {
        result = await chattingService.getChattings(socketId);
      } else {
        result = await chattingService.getChattings("");

        if (loginState && !result.username) {
          logout();
        }
      }

      await modifyDate(result.chatList);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const leaveChatting = async (roomname: string) => {
    const result = window.confirm("해당 채팅 내용을 삭제하시겠습니까?");

    if (!result) {
      return;
    }

    try {
      await chattingService.deleteChatting(roomname);

      getChattings();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const joinChatting = async (roomname: string) => {
    try {
      setRoomName(roomname);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const newChatting = async () => {
    if (chatList.length >= 5) {
      alert(
        "더 이상 새로운 채팅을 시작하실 수 없습니다\n기존 채팅 삭제후 새로운 채팅을 시작해 주세요"
      );
      return;
    }

    try {
      setNewRoom(true);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const backToList = () => {
    newRoom ? setNewRoom(false) : setJoinRoom(false);

    leaveRoom(roomName)
    setRoomName("");
    getChattings();
  };

  useEffect(() => {
    if (roomName) {
      setJoinRoom(true);
    } else {
      setJoinRoom(false);
    }
  }, [roomName]);

  useEffect(() => {
    if (socketEvent === "joinError") {
      setNewRoom(false);
      setJoinRoom(false);
      setSocketEvent("");
    }
  }, [socketEvent]);

  useEffect(() => {
    getChattings();

    return () => {
      setRoomName("");
      setNewRoom(false);
      setJoinRoom(false);
    };
  }, []);

  return (
    <div className="chatting-wrapper">
      <div className="top-bar">
        <CloseButton clickEventHandler={closeChattingList} />
        {joinRoom || newRoom ? (
          <p className="back-to-list-btn" onClick={backToList}>
            {" "}
            {"<< 채팅목록으로 돌아가기"}
          </p>
        ) : null}
      </div>
      {joinRoom || newRoom ? (
        <Chatting
          loginState={loginState}
          logout={logout}
          socketId={socketId}
          socketEvent={socketEvent}
          setSocketEvent={setSocketEvent}
          roomName={roomName}
          newRoom={newRoom}
          joinRoom={joinRoom}
          username={username}
        />
      ) : (
        <>
          <div className="chatting-list">
            {chatList.length < 1 ? (
              <div>
                채팅을 시작하시려면 아래 '새로운 문의' 버튼을 눌러주세요
              </div>
            ) : (
              chatList.map((chat) => {
                return (
                  <div className="list">
                    <div
                      className="content"
                      onClick={() => joinChatting(chat.room_name)}
                    >
                      <div className="text">{chat.lastChat}</div>
                      <div className="time">{chat.lastChatTime}</div>
                    </div>
                    <CloseButton
                      clickEventHandler={() => leaveChatting(chat.room_name)}
                    />
                  </div>
                );
              })
            )}
          </div>
          <div className="bottom-wrapper">
            <button
              className="new-chatting-btn"
              type="button"
              onClick={newChatting}
            >
              새로운 문의
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ChattingList;

// function ChattingSummary(){
//   return(
//     <div className="list">
//       <div
//         className="content"
//         onClick={() => joinChatting(chat.room_name)}
//       >
//         <div className="text">{chat.lastChat}</div>
//         <div className="time">{chat.lastChatTime}</div>
//       </div>
//       <div className="btn-wrapper">
//         <span onClick={() => leaveChatting(chat.room_name)}>
//           x
//         </span>
//       </div>
//     </div>
//   )
// }
