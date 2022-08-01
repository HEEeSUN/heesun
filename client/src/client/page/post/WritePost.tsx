import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import "./post.css";
import { CommunityService } from "../../model/community.model";
import PostForm from "./components/PostForm";

type Props = {
  setNewPost: React.Dispatch<React.SetStateAction<boolean>>;
  communityService: CommunityService;
};

function WritePost(props: Props) {
  let [title, setTitle] = useState<string>("");
  let [content, setContent] = useState<string>("");
  let history = useHistory();
  let { setNewPost, communityService } = props;

  /* 게시글 등록 */
  const post = async () => {
    if (!title || title.length > 100) {
      alert("제목을 확인해 주세요");
      return;
    }

    if (!content) {
      alert("내용을 작성해 주세요");
      return;
    }

    const { postId } = await communityService.post(title, content);

    if (postId) {
      alert("post 등록이 완료되었습니다.");
      history.push(`/home/community/${postId}`);
      setNewPost(false);
    }
  };

  /* 게시글 등록 취소 */
  const cancel = async () => {
    const confirm = window.confirm(
      "작성한 게시글의 내용이 저장되지 않았습니다\n게시글 작성을 취소하시겠습니까?"
    );

    if (confirm) {
      history.push(`/home/community`);
      setNewPost(false);
    }
  };

  const settings = async (name: string, value: string) => {
    switch (name) {
      case "title":
        setTitle(value);
        break;
      case "content":
        setContent(value);
        break;
    }
  };

  useEffect(() => {
    return () => {
      setNewPost(false);
    };
  }, []);

  return (
    <PostForm
      title={"게시글 작성"}
      handlesubmitEvent={post}
      handleCancelEvent={cancel}
      settings={settings}
    />
  );
}

export default WritePost;
