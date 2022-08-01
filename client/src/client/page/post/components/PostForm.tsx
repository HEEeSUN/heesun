import { Posts } from "../../../model/community.model";

type Props = {
  title: string;
  postTitle?: string;
  postContent?: string;
  settings?: (name: string, value: string) => Promise<void>;
  handlesubmitEvent: () => Promise<void>;
  handleCancelEvent: () => Promise<void>;
  readOnly?: boolean;
  post?: Posts;
  username?: string;
};

function PostForm(props: Props) {
  const {
    title,
    postTitle,
    postContent,
    settings,
    handlesubmitEvent,
    handleCancelEvent,
    readOnly,
    post,
    username,
  } = props;

  return (
    <div className="write-post">
      <h4>{title}</h4>

      <div className="content-header">
        {readOnly ? (
          <>
            <div className="content-title">{post?.title}</div>
            <div className="content-info">
              <div>
                <span>{post?.username}</span>|<span>{post?.createdAt}</span>
              </div>
              {post?.originUsername === username ? (
                <div>
                  <span onClick={handlesubmitEvent}>수정</span>|
                  <span onClick={handleCancelEvent}>삭제</span>
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <input
            className={!readOnly ? "post-title" : "content-title"}
            value={postTitle || post?.title}
            name="title"
            autoFocus
            onChange={(e) => {
              settings && settings(e.target.name, e.target.value);
            }}
          ></input>
        )}
      </div>
      <div className="content">
        {readOnly ? (
          post?.content
        ) : (
          <textarea
            className="post-content"
            value={postContent || post?.content}
            name="content"
            onChange={(e) => {
              settings && settings(e.target.name, e.target.value);
            }}
          ></textarea>
        )}
      </div>
      {!readOnly && (
        <>
          <button className="submit-btn" onClick={handlesubmitEvent}>
            등록
          </button>
          <button className="submit-btn" onClick={handleCancelEvent}>
            취소
          </button>
        </>
      )}
    </div>
  );
}

export default PostForm;
