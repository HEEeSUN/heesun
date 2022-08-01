type Chat = {
  chat_id: number;
  room_name: string;
  username: string;
  member: number;
  noReadMsg: number;
  lastChat: string;
  lastChatTime: string;
  chatTime?: string;
  status: boolean;
};

export const parseDate = async (chatList: Chat[]) => {
  const today = new Date();
  const now = today.getTime();
  const day = 86400000;
  const week = 604800000;
  const yesterDay = new Date(now - day);
  const dayOfWeek = ["월", "화", "수", "목", "금", "토", "일"];

  let chatTime;

  chatList.map((chat) => {
    if (chat.lastChatTime) {
      const lastChatTime = chat.lastChatTime;

      const temp = lastChatTime.split(" ");
      const temp1 = temp[0].split("-");
      const temp2 = temp[1].split(":");
      chatTime = new Date(
        Number(temp1[0]),
        Number(temp1[1]) - 1,
        Number(temp1[2]),
        Number(temp2[0]),
        Number(temp2[1]),
        Number(temp2[2])
      );
      const differ = now - chatTime.getTime();

      if (today.getFullYear() - Number(temp1[0]) > 1) {
        chat.chatTime = `${temp1[0]}-${Number(temp1[1])}-${temp1[2]}`;
      } else if (differ < day) {
        chat.chatTime = chat.lastChatTime.substr(11, 5);
      } else if (
        day < differ &&
        yesterDay.getMonth() + 1 === Number(temp1[1]) &&
        yesterDay.getDate() === Number(temp1[2])
      ) {
        chat.chatTime = `어제`;
      } else if (day < differ && differ < week) {
        const dayNum = chatTime.getDay();
        chat.chatTime = `${dayOfWeek[dayNum - 1]}요일`;
      } else {
        chat.chatTime = `${Number(temp1[1])}월 ${temp1[2]}일`;
      }
    }
  });

  return chatList;
};

export const minute = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0")
);
export const hour = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0")
);
