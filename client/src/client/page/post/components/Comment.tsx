import { useEffect, useState } from "react";
import { Comments, CommunityService } from "../../../model/community.model";
import Page from "../../../components/Page";
import Button from "../../../components/Button";

type Props = {
  postId: string;
  username: string;
  communityService: CommunityService;
};

function Comment(props: Props) {
  let [comments, setComments] = useState<Comments[]>([]);
  let [comment, setComment] = useState<string>("");
  let [pageLength, setPageLength] = useState<number>(0);
  let [change, setChange] = useState<boolean>(false);
  let [pageNumber, setPageNumber] = useState<number>(1);
  let [newComment, setNewComment] = useState<boolean>(false);

  let { postId, username, communityService } = props;

  useEffect(() => {
    getComments();
  }, [pageNumber]);

  const getComments = async () => {
    try {
      const { comments, commentPageLength } =
        await communityService.getComments(postId, pageNumber);

      setPageLength(commentPageLength);
      setChange(true);
      setComments(comments);
    } catch (error: any) {
      alert(error.message);
    }
  };

  /* 댓글 작성 */
  const writeComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!comment || comment.length > 500) {
      alert("내용을 확인해 주세요");
      return;
    }

    try {
      await communityService.writeComment(postId, comment);

      alert("댓글이 등록되었습니다");
      setNewComment(true);
      setComment("");
      getComments();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const deleteComment = async (commentId: number) => {
    try {
      await communityService.deleteComment(commentId);

      alert("댓글이 삭제되었습니다");
      getComments();
    } catch (error: any) {
      alert(error.message);
    }
  };

  useEffect(() => {
    if (comment.length <= 500) {
      return;
    }

    setComment(comment.slice(0, 500));
  }, [comment]);

  return (
    <div className="comment-area">
      <div className="comments">
        {comments.length === 0 ? (
          <div className="comment"> 작성된 댓글이 아직 없습니다 </div>
        ) : (
          comments.map((comment: Comments) => {
            return (
              <div className="comment">
                <div className="comment-left">
                  <div className="comment-info">
                    <span>{comment.username}</span>
                    <span>{comment.createdAt}</span>
                  </div>
                  <div className="comment-content">{comment.content}</div>
                </div>
                <div className="comment-right">
                  {comment.originUsername === username ? (
                    <div onClick={() => deleteComment(comment.comment_id)}>
                      X
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="comment-paging">
        <Page
          amountOfPerPage={5}
          setNewComment={setNewComment}
          newComment={newComment}
          change={change}
          setChange={setChange}
          pageLength={pageLength}
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
        />
      </div>
      <form className="comment-input" onSubmit={writeComment}>
        <textarea
          placeholder={!username ? "로그인후 이용가능합니다" : ""}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={!username}
        ></textarea>
        {username && <Button title={"등록"} type={"submit"} />}
      </form>
    </div>
  );
}

export default Comment;
