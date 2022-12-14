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

  /* ?????? ?????? ?????? ???????????? ????????? ????????? ???????????? ???*/
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToBottom1 = () => {
    messagesEndRef1.current?.scrollIntoView();
  };

  /* socket ????????? ????????? ????????? ??????????????? ?????? ??? ?????? ???????????? ?????? ?????? ?????? */
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

  /* ????????? ?????? */
  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!myChat) {
      alert("????????? ???????????????");
      return;
    }

    const tempChattingId = String(new Date().valueOf()).substring(6, 13);
    let tmpChatting = [...tempChatting];
    tmpChatting.push({
      uniqueId: tempChattingId,
      text: myChat,
      username: "master",
      createdAt: "?????????",
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

  /* ???????????? ?????? ????????? ????????? ?????? ?????? ???????????? */
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
      alert(error.message || "????????? ?????? ????????? ?????????????????????");
    }
  };

  /* ?????? ?????? ?????? */
  const deleteChat = async () => {
    const result = window.confirm("????????? ?????????????????????????");

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

  /* ?????? ????????? ?????? */
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
      alert("????????? 500??? ????????? ????????? ?????????");
      setMyChat(myChat.slice(0, 500));
    }
  }, [myChat]);

  return (
    <div className="chatting-wrapper">
      <div className="chatting-top-bar">
        <span onClick={backToList}>????????????</span>
        <p>{chatRoomName}</p>
        <span onClick={deleteChat}>?????????</span>
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
          <div>????????? ????????? ???????????? ??? ?????? ???????????? ??? ????????????</div>
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
          ??????
        </button>
      </form>
    </div>
  );
}

export default Chattings;
