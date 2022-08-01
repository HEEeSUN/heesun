import { useHistory } from "react-router-dom";
import { PostSummary } from "../model/community.model";

type P = {
  posts: PostSummary[];
};

function Posts({ posts }: P) {
  let history = useHistory();
  console.log(posts);

  return (
    <table className="post-list">
      <thead>
        <tr>
          <td className="post-number">번호</td>
          <td className="post-title">제목</td>
          <td className="post-username">작성자</td>
          <td className="post-created">작성일</td>
        </tr>
      </thead>
      <tbody>
        {posts.map((post) => {
          return (
            <tr>
              <td className="post-number">{post.post_id}</td>
              <td
                className="post-title"
                onClick={() => history.push(`/home/community/${post.post_id}`)}
              >
                <span>{post.title}</span>
              </td>
              <td className="post-username">{post.username}</td>
              <td className="post-created">{post.createdAt}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default Posts;
