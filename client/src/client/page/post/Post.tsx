import { useParams, useHistory } from "react-router-dom";
import { useEffect, useState } from "react";
import "./post.css";
import { UseParams } from "../../model/model";
import { Posts, CommunityService } from "../../model/community.model";
import Comment from "./components/Comment";
import PostForm from "./components/PostForm";

type Props = {
  communityService: CommunityService;
  username: string;
};

function Post({ communityService, username }: Props) {
  let [modify, setModify] = useState<boolean>(false);
  let [post, setPost] = useState<Posts>();
  let [title, setTitle] = useState<string>("");
  let [content, setContent] = useState<string>("");
  let history = useHistory();
  const postId: string = useParams<UseParams>().id;

  /* 게시물 내용 가져오기 */
  const getPost = async () => {
    try {
      const { post } = await communityService.getPost(postId);

      setPost(post);
      setTitle(post.title);
      setContent(post.content);
    } catch (error: any) {
      alert(error.message);
      history.push("/home/community");
    }
  };

  /* 자신이 작성한 게시글 삭제 */
  const deletePost = async () => {
    try {
      await communityService.deletePost(postId);

      alert("게시글이 삭제되었습니다");
      history.push(`/home/community`);
    } catch (error: any) {
      alert(error.message);
    }
  };

  /* 게시글 수정  */
  const modifyPost = async () => {
    try {
      await communityService.modifyPost(postId, title, content);

      alert("게시글 수정이 완료되었습니다.");
      setModify(false);
    } catch (error: any) {
      alert(error.message);
      setModify(false);
    }
  };

  /* 게시글 수정 취소 */
  const cancel = async () => {
    const confirm = window.confirm("게시글 수정을 취소하시겠습니까?");

    if (confirm) {
      setModify(false);
    }
  };

  /* 게시글 수정 폼 보여주기 */
  const showModifyForm = async () => {
    setModify(true);
  };

  /* 게시글 제목 및 내용 변경시 실행 */
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
    if (!modify) {
      getPost();
    }
  }, [modify]);

  return (
    <div className="post">
      {!modify && post && (
        <>
          <PostForm
            title={""}
            handlesubmitEvent={showModifyForm}
            handleCancelEvent={deletePost}
            readOnly={true}
            username={username}
            post={post}
          />
          <Comment
            postId={postId}
            username={username}
            communityService={communityService}
          />
        </>
      )}
      {modify && (
        <PostForm
          title={"게시글 수정"}
          postTitle={title}
          postContent={content}
          settings={settings}
          handlesubmitEvent={modifyPost}
          handleCancelEvent={cancel}
        />
      )}
    </div>
  );
}

export default Post;
