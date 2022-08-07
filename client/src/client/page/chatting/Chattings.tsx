import { useCallback, useEffect, useRef, useState } from "react";
import "./chatting.css";
import * as socketService from "../../service/socket";
import { TempChatting, TempChattingCheck } from "../../model/chatting.model";
import Chatting from "./components/Chatting";

type Props = {
  loginState: boolean;
  logout: () => void;
  socketId: string;
  socketEvent: string;
  setSocketEvent: React.Dispatch<React.SetStateAction<string>>;
  roomName: string;
  newRoom: boolean;
  joinRoom: boolean;
  username: string;
};

function Chattings(props: Props) {
  let [prevChatting, setPrevChatting] = useState<TempChatting[]>([]);
  let [skip, setSkip] = useState<boolean>(true);
  let [loading, setLoading] = useState<boolean>(true);
  let [hasmore, setHasmore] = useState<boolean>(false);
  let [pageNumber, setPageNumber] = useState<number>(1);
  let [text, setText] = useState<string>("");
  let [chatting, setChatting] = useState<TempChatting[]>([]);
  let [tempChatting, setTempChatting] = useState<TempChattingCheck[]>([]);
  let [masterLeaveOrNot, setMasterLeaveOrNot] = useState<boolean>(false);
  const {
    username,
    loginState,
    logout,
    socketId,
    socketEvent,
    setSocketEvent,
    roomName,
    newRoom,
    joinRoom,
  } = props;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesEndRef1 = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver>();

  let prevChatTIme: string = "";
  let chatTime: string = "";

  const socketEventProcess = async () => {
    switch (socketEvent) {
      case "receiveMessage":
        getNewMessage();
        break;
      case "masterLeave":
        setMasterLeaveOrNot(false);
        break;
      case "couple":
        setMasterLeaveOrNot(true);
        break;
    }
    setSocketEvent("");
  };

  useEffect(() => {
    if (!socketEvent) {
      return;
    }
    socketEventProcess();
  }, [socketEvent]);

  /* 화면에 출력된 element중 마지막 element가 현재 브라우저에 교차상태일 경우 새로운 데이터를 받아올 수 있게 무한 스크롤링 구현*/
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

  /* 메시지 전송 */
  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!text) {
      alert("문의하실 내용을 적어주세요");
      return;
    }
    try {
      if (newRoom && prevChatting.length < 1 && chatting.length < 1) {
        await socketService.joinRoom(username, socketId);
      }

      const tempChattingId = String(new Date().valueOf()).substring(6, 13);
      let tmpChatting = [...tempChatting];

      tmpChatting.push({
        uniqueId: tempChattingId,
        text: text,
        username: username,
        createdAt: "전송중",
      });
      setTempChatting(tmpChatting);
      setText("");

      const { newChatting, user } = await socketService.sendMessage(
        tempChattingId,
        text,
        masterLeaveOrNot,
        socketId
      );

      if (loginState && !user) {
        alert("로그인이 만료되었습니다\n다시 로그인해 주세요");
        logout();
        return;
      }

      if (newChatting) {
        setNewChatting(newChatting);

        let tempArray2 = [...tempChatting];
        tempArray2 = tempArray2.filter(
          (item) => item.uniqueId != newChatting.uniqueId
        );
        setTempChatting(tempArray2);
      }
    } catch (error: any) {
      if (error.message === "socket error") {
        setSocketEvent("socketError");
        alert("잠시후 다시 시도해주세요");
      } else {
        alert(error.message);
      }
    }
  };

  const setNewChatting = async (newChatting: TempChattingCheck) => {
    let tmpChatting: TempChatting[] = [];

    let date = newChatting.createdAt.substring(0, 10);
    let time = newChatting.createdAt;
    time = time.substr(11, 5);
    tmpChatting.push({
      text: newChatting.text,
      username: newChatting.username,
      date: date,
      createdAt: time,
    });

    const temp = [...chatting, ...tmpChatting];
    setChatting(temp);
    scrollToBottom();
  };

  const getNewMessage = async () => {
    type Result = {
      newChatting: TempChattingCheck;
      username: string | undefined;
    };

    try {
      const result: Result = await socketService.getNewMessage();
      const { username, newChatting } = result;

      if (loginState && !username) {
        alert("로그인이 만료되었습니다\n다시 로그인해 주세요");
        logout();
        return;
      }

      if (newChatting) {
        setNewChatting(newChatting);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getMessage = async () => {
    try {
      type Result = {
        username: string | undefined;
        newChatting: TempChatting[] | [];
        hasmore: boolean;
      };

      setLoading(true);
      const result: Result = await socketService.getMessage(pageNumber);
      const { username, newChatting, hasmore } = result;

      if (loginState && !username) {
        alert("로그인이 만료되었습니다\n다시 로그인해 주세요");
        logout();
        return;
      }

      let tmpChatting: TempChatting[] = [];
      if (newChatting.length > 0) {
        newChatting.map((chat) => {
          let date = chat.createdAt.substring(0, 10);
          let time = chat.createdAt;
          time = time.substr(11, 5);
          tmpChatting.push({
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
      alert(error.message);
    }
  };

  /* 문의창이 항상 자동으로 마지막 채팅을 보여지게 함*/
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToBottom1 = () => {
    messagesEndRef1.current?.scrollIntoView();
  };

  useEffect(() => {
    if (text.length <= 500) {
      return;
    }

    alert("내용은 500자 이하로 작성해 주세요");
    setText(text.slice(0, 500));
  }, [text]);

  useEffect(() => {
    if (skip) {
      setSkip(false);
      return;
    }
    if (pageNumber === 0) {
      setPageNumber(1);
    } else {
      getMessage();
    }
  }, [pageNumber]);

  useEffect(() => {
    if (joinRoom) {
      socketService.joinRoom(username, socketId, roomName).then(getMessage);
    }
  }, []);
  // 최초실행시 socket 클래스에 있는 initSocket을 이용해 socket 인스턴스 생성

  return (
    <>
      <div className="chatting-list">
        <div className="chatting">
          <div className="prevchatting">
            {prevChatting.map((chat, key) => {
              if (key === 0 && chat.date) {
                prevChatTIme = chat.date;
                return (
                  <>
                    <p className="chatting-date">{chat.date}</p>
                    <Chatting firstElement={firstElement} chat={chat} />
                  </>
                );
              }
              if (chat.date && prevChatTIme < chat.date) {
                prevChatTIme = chat.date;
                return (
                  <>
                    <p className="chatting-date">{chat.date}</p>
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
                  <p className="chatting-date">{chat.date}</p>
                  <Chatting chat={chat} />
                </>
              );
            }
            if (chat.date && chatTime < chat.date && prevChatTIme < chat.date) {
              chatTime = chat.date;
              return (
                <>
                  <p className="chatting-date">{chat.date}</p>
                  <Chatting chat={chat} />
                </>
              );
            }
            return <Chatting chat={chat} />;
          })}
          <div>
            {tempChatting &&
              tempChatting.map((chat) => {
                return <Chatting chat={chat} />;
              })}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>
      <form className="bottom-wrapper" onSubmit={sendMessage}>
        <input
          type="text"
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></input>
        <button className="send-btn" type="submit">
          전송
        </button>
      </form>
    </>
  );
}

export default Chattings;
