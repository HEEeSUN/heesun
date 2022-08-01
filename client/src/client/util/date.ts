import { Chat } from "../model/chatting.model";
import { PostSummary } from "../model/community.model";

export const parseDateForCommunity = (postList: PostSummary[]) => {
  const today = new Date();
  const now = today.getTime();
  const day = 86400000;
  const hour = 3600000;
  const minute = 60000;

  postList.map((post) => {
    if (!post.createdAt) {
      return;
    }

    const temp = post.createdAt.split(" ");
    const temp1 = temp[0].split("-");
    const temp2 = temp[1].split(":");
    const createdTime = new Date(
      Number(temp1[0]),
      Number(temp1[1]) - 1,
      Number(temp1[2]),
      Number(temp2[0]),
      Number(temp2[1]),
      Number(temp2[2])
    );

    const differ = now - createdTime.getTime();

    if (differ < minute) {
      post.createdAt = "방금";
    } else if (differ < hour) {
      post.createdAt = `${Math.floor(differ / minute)}분전`;
    } else if (differ < day) {
      post.createdAt = `${Math.floor(differ / hour)}시간전`;
    } else if (today.getFullYear() - Number(temp1[0]) > 0) {
      post.createdAt = `${temp1[0]}-${temp1[1]}-${temp1[2]}`;
    } else {
      post.createdAt = `${temp1[1]}월 ${temp1[2]}일`;
    }
  });

  return postList;
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

      if (today.getFullYear() - Number(temp1[0]) > 0) {
        chat.lastChatTime = `${temp1[0]}-${Number(temp1[1])}-${temp1[2]}`;
      } else if (differ < day) {
        chat.lastChatTime = `오늘 ${chat.lastChatTime.substr(11, 5)}`;
      } else if (
        day < differ &&
        yesterDay.getMonth() + 1 === Number(temp1[1]) &&
        yesterDay.getDate() === Number(temp1[2])
      ) {
        chat.lastChatTime = `어제`;
      } else if (day < differ && differ < week) {
        const dayNum = chatTime.getDay();
        chat.lastChatTime = `${dayOfWeek[dayNum - 1]}요일`;
      } else {
        chat.lastChatTime = `${Number(temp1[1])}월 ${temp1[2]}일`;
      }
    }
  });

  return chatList;
};
