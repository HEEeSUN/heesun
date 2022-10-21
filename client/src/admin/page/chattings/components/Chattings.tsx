import { useCallback, useEffect, useRef, useState } from "react";
import Chatting from "./Chatting";
import {
  AdminChattingService,
  SocketEvent,
  TempChat,
  TempChattingCheck,
} from "../../../model/chatting.model";

type Props = {
  adminChattingService: AdminChattingService;

  socketEventOccur: (ssocketEventData: SocketEvent) => Promise<void>;
  socketService: {
    joinRoom: (roomname: string) => Promise<any>;
    leaveRoom: (roomname: string) => Promise<any>;
    sendMessage: (
      uniqueId: string,
      chat: string,
      roomname: string,
      master: boolean,
      chattingUser: string
    ) => Promise<any>;
    getChatting: (
      roomname: string,
      pageNumber: number,
      chattingUser: string
    ) => Promise<any>;
    getNewChatting: (roomname: string, chattingUser: string) => Promise<any>;
  };
  privateSocketEvent: string;
  setPrivateSocketEvent: React.Dispatch<React.SetStateAction<string>>;
  setPrivatechat: React.Dispatch<React.SetStateAction<boolean>>;
  chatRoomName: string;
  chattingStatus: boolean;
  getInquiry: () => Promise<void>;
};

function Chattings(props: Props) {
  const chattingUser = "master";
  let [prevChatting, setPrevChatting] = useState<TempChat[]>([]);
  let [skip, setSkip] = useState<boolean>(true);
  let [loading, setLoading] = useState<boolean>(true);
  let [hasmore, setHasmore] = useState<boolean>(false);
  let [pageNumber, setPageNumber] = useState<number>(1);
  let [myChat, setMyChat] = useState<string>("");
  let [chatting, setChatting] = useState<TempChat[]>([]);
  let [tempChatting, setTempChatting] = useState<TempChattingCheck[]>([]);
  let [connection, setConnection] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesEndRef1 = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver>();
  let prevChatTIme: string = "";
  let chatTime: string = "";
  let {
    adminChattingService,
    socketEventOccur,
    socketService,
    privateSocketEvent,
    setPrivateSocketEvent,
    setPrivatechat,
    chatRoomName,
    chattingStatus,
    getInquiry
  } = props;

  const firstElement = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasmore) {
          setPageNumber((prevPageNumber) => prevPageNumber + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasmore, loading]
  );

  /* 문의 창이 항상 자동으로 마지막 채팅을 보여지게 함*/
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToBottom1 = () => {
    messagesEndRef1.current?.scrollIntoView();
  };

  /* socket 이벤트 발생시 어떠한 이벤트인지 확인 후 해당 이벤트에 맞는 작업 실행 */
  const socketEventProcess = () => {
    switch (privateSocketEvent) {
      case "receiveMessage":
        getNewMessage();
        break;
      case "couple":
        setConnection(true);
        break;
      case "leave":
        setConnection(false);
        break;
    }
    setPrivateSocketEvent("");
  };

  /* 메시지 전송 */
  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!myChat) {
      alert("내용을 적어주세요");
      return;
    }

    const tempChattingId = String(new Date().valueOf()).substring(6, 13);
    let tmpChatting = [...tempChatting];
    tmpChatting.push({
      uniqueId: tempChattingId,
      text: myChat,
      username: "master",
      createdAt: "전송중",
    });
    setTempChatting(tmpChatting);
    setMyChat("");

    const { newChatting } = await socketService.sendMessage(
      tempChattingId,
      myChat,
      chatRoomName,
      true,
      chattingUser
    );

    if (newChatting) {
      let tmpChatting: TempChat[] = [];
      let tempArray2 = [...tempChatting];

      let date = newChatting.createdAt.substring(0, 10);
      let time = newChatting.createdAt;
      time = time.substr(11, 5);
      tmpChatting.push({
        uniqueId: connection ? "" : newChatting.uniqueId,
        text: newChatting.text,
        username: newChatting.username,
        date: date,
        createdAt: time,
      });
      tempArray2 = tempArray2.filter(
        (item) => item.uniqueId != newChatting.uniqueId
      );

      const temp = [...chatting, ...tmpChatting];
      setChatting(temp);
      setTempChatting(tempArray2);
      scrollToBottom();

      socketEventOccur("updateChatList");
    }
  };

  const getNewMessage = async () => {
    type Result = {
      newChatting: TempChattingCheck;
      username: string | undefined;
    };

    try {
      const result: Result = await socketService.getNewChatting(
        chatRoomName,
        chattingUser
      );
      const { newChatting } = result;

      if (newChatting) {
        let tmpChatting: TempChat[] = [];

        let date = newChatting.createdAt.substring(0, 10);
        let time = newChatting.createdAt;
        time = time.substr(11, 5);
        tmpChatting.push({
          uniqueId: newChatting.uniqueId,
          text: newChatting.text,
          username: newChatting.username,
          date: date,
          createdAt: time,
        });

        const temp = [...chatting, ...tmpChatting];
        setChatting(temp);
      }

      scrollToBottom();
    } catch (error: any) {
      alert(error.message);
    }
  };

  /* 채팅창을 처음 실행시 저장된 채팅 내용 불러오기 */
  const getChatting = async () => {
    try {
      type Result = {
        newChatting: TempChat[] | [];
        hasmore: boolean;
      };

      setLoading(true);

      const result: Result = await socketService.getChatting(
        chatRoomName,
        pageNumber,
        chattingUser
      );
      const { newChatting, hasmore } = result;
      let tmpChatting: TempChat[] = [];

      if (newChatting.length > 0) {
        newChatting.map((chat) => {
          let date = chat.createdAt.substring(0, 10);
          let time = chat.createdAt;
          time = time.substr(11, 5);
          tmpChatting.push({
            uniqueId: chat.uniqueId,
            text: chat.text,
            username: chat.username,
            date: date,
            createdAt: time,
          });
        });
      }
      const temp1 = [...prevChatting, ...chatting];
      setChatting(temp1);
      setPrevChatting(tmpChatting);

      setHasmore(hasmore);
      setLoading(false);

      scrollToBottom1();
    } catch (error: any) {
      alert(error.message || "예기치 못한 오류가 발생하였습니다");
    }
  };

  /* 대화 내용 삭제 */
  const deleteChat = async () => {
    const result = window.confirm("대화를 삭제하시겠습니까?");

    if (result) {
      try {
        await adminChattingService.deleteChat(chatRoomName);
        await getInquiry();
        
        setPrivatechat(false);
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  /* 개인 채팅창 종료 */
  const backToList = async () => {
    setPrivatechat(false);
  };

  const readAll = async () => {
    const temp = [...chatting];
    temp.map((chat) => {
      chat.uniqueId = "";
    });
    setChatting(temp);

    const find = prevChatting.find((chat) => chat.uniqueId !== "");

    if (find) {
      const temp = [...prevChatting];
      temp.map((chat) => {
        chat.uniqueId = "";
      });
      setPrevChatting(temp);
    }
  };

  useEffect(() => {
    if (connection) {
      readAll();
    }
  }, [connection]);

  useEffect(() => {
    if (privateSocketEvent) {
      socketEventProcess();
    }
  }, [privateSocketEvent]);

  useEffect(() => {
    socketService.joinRoom(chatRoomName).then(getChatting).then(getInquiry);

    return () => {
      socketService.leaveRoom(chatRoomName);
    };
  }, [chatRoomName]);

  useEffect(() => {
    if (skip) {
      setSkip(false);
      return;
    }
    if (pageNumber === 0) {
      setPageNumber(1);
    } else {
      getChatting();
    }
  }, [pageNumber]);

  useEffect(() => {
    if (myChat.length > 500) {
      alert("내용은 500자 이하로 작성해 주세요");
      setMyChat(myChat.slice(0, 500));
    }
  }, [myChat]);

  return (
    <div className="chatting-wrapper">
      <div className="chatting-top-bar">
        <span onClick={backToList}>목록으로</span>
        <p>{chatRoomName}</p>
        <span onClick={deleteChat}>나가기</span>
      </div>
      <div className="chatting-main">
        <div>
          {prevChatting.map((chat, key) => {
            if (key === 0 && chat.date) {
              prevChatTIme = chat.date;
              return (
                <>
                  <p>{chat.date}</p>
                  <Chatting chat={chat} firstElement={firstElement} />
                </>
              );
            }
            if (chat.date && prevChatTIme < chat.date) {
              prevChatTIme = chat.date;
              return (
                <>
                  <p>{chat.date}</p>
                  <Chatting chat={chat} />
                </>
              );
            }
            return <Chatting chat={chat} />;
          })}
          <div ref={messagesEndRef1} />
        </div>
        {chatting.map((chat, key) => {
          if (key === 0 && chat.date && prevChatTIme < chat.date) {
            chatTime = chat.date;
            return (
              <>
                <p>{chat.date}</p>
                <Chatting chat={chat} />
              </>
            );
          }
          if (chat.date && chatTime < chat.date && prevChatTIme < chat.date) {
            chatTime = chat.date;
            return (
              <>
                <p>{chat.date}</p>
                <Chatting chat={chat} />
              </>
            );
          }
          return <Chatting chat={chat} />;
        })}
        <div>
          {!tempChatting
            ? null
            : tempChatting.map((chat) => {
                return <Chatting chat={chat} />;
              })}
        </div>
        {!chattingStatus && (
          <div>고객이 삭제한 채팅으로 더 이상 대화하실 수 없습니다</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="chatting-input" onSubmit={sendMessage}>
        <input
          type="text"
          name="text"
          value={myChat}
          onChange={(e) => setMyChat(e.target.value.trim())}
          disabled={!chattingStatus}
        ></input>
        <button type="submit" disabled={!chattingStatus}>
          전송
        </button>
      </form>
    </div>
  );
}

export default Chattings;
