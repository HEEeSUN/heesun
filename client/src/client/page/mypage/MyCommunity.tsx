import { useEffect, useState } from "react";
import { MemberService } from "../../model/member.model";
import { PostSummary } from "../../model/community.model";
import SlideMenuBar from "../../components/SlideMenuBar";
import Button from "../../components/Button";
import Posts from "../../components/Posts";
import NoticeNoContent from "../../components/NoticeNoContent";

type Props = {
  memberService: MemberService;
};

function MyCommunity({ memberService }: Props) {
  let [clickedMenu, setClickedMenu] = useState<number>(1);
  let [posts, setPosts] = useState<PostSummary[]>([]);
  let [postPageNumber, setPostPageNumber] = useState<number>(1);
  let [hasmore, setHasmore] = useState<number>(0);

  const getPosts = async () => {
    try {
      const { newPosts, hasmore } = await memberService.getMyPost(
        postPageNumber
      );

      const tempArray = [...posts, ...newPosts];
      setPosts(tempArray);
      setHasmore(hasmore);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getPostsWithMyComment = async () => {
    try {
      const { newPosts, hasmore } = await memberService.getPostsWithMyComment(
        postPageNumber
      );

      const tempArray = [...posts, ...newPosts];
      setPosts(tempArray);
      setHasmore(hasmore);
    } catch (error: any) {
      alert(error.message);
    }
  };

  useEffect(() => {
    setPosts([]);
    setHasmore(0);
    setPostPageNumber(0);
  }, [clickedMenu]);

  useEffect(() => {
    if (!postPageNumber) {
      setPostPageNumber(1);
    } else {
      if (clickedMenu === 1) {
        getPosts();
      } else {
        getPostsWithMyComment();
      }
    }
  }, [postPageNumber]);

  return (
    <div className="my-post">
      <SlideMenuBar
        menuTitle1={"작성 게시물"}
        menuTitle2={"댓글을 단 게시물"}
        clickedMenu={clickedMenu}
        setClickedMenu={setClickedMenu}
      />
      <div className="content">
        {posts.length < 1 ? (
          <NoticeNoContent
            message={
              clickedMenu === 1
                ? "작성한 게시글이 없습니다"
                : "댓글을 작성한 게시글이 없습니다"
            }
          />
        ) : (
          <Posts posts={posts} />
        )}
        {hasmore ? (
          <Button
            title={"더보기"}
            handleClickEvent={() => setPostPageNumber((curr) => curr + 1)}
          />
        ) : null}
      </div>
    </div>
  );
}

export default MyCommunity;
