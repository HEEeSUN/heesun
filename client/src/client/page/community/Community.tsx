import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import "./community.css";
import { parseDateForCommunity } from "../../util/date";
import { refineSearchWord } from "../../util/search";
import { PostSummary, CommunityService } from "../../model/community.model";
import Button from "../../components/Button";
import Page from "../../components/Page";
import Posts from "../../components/Posts";
import NoticeNoContent from "../../components/NoticeNoContent";
import Category from "../../components/Category";
import WritePost from "../post/WritePost";

type Props = {
  communityService: CommunityService;
  loginState: boolean;
};

function Community({ communityService, loginState }: Props) {
  let [newPost, setNewPost] = useState<boolean>(false);
  let [posts, setPosts] = useState<PostSummary[]>([]);
  let [searchCategory, setSearchCategory] = useState<string>("");
  let [searchWord, setSearchWord] = useState<string>("");
  let [staticSearchWord, setStaticSearchWord] = useState<string>("");
  let [pageLength, setPageLength] = useState<number>(0);
  let [pageNumber, setPageNumber] = useState<number>(1);
  let [change, setChange] = useState<boolean>(false);
  let [search, setSearch] = useState<boolean>(false);
  let history = useHistory();

  const categoryItems = [
    {
      name: "전체보기",
      value: "",
      selected: true,
    },
    {
      name: "글제목",
      value: "title",
      selected: false,
    },
    {
      name: "작성자명",
      value: "username",
      selected: false,
    },
  ];

  useEffect(() => {
    if (pageNumber === 0) {
      setPageNumber(1);
    } else {
      getPosts();
    }
  }, [pageNumber]);

  /* 게시글 가져오기 */
  const getPosts = async () => {
    try {
      const { posts, postPageLength } = await communityService.getPosts(
        searchCategory,
        staticSearchWord,
        pageNumber
      );

      setPageLength(postPageLength);
      setChange(true);

      setPosts(parseDateForCommunity(posts));
    } catch (error: any) {
      alert(error.message);
    }
  };

  const searching = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchWord || searchWord.length > 50) {
      alert("검색어를 확인해 주세요");
      return;
    }

    let search = searchWord.trim();
    if (search.includes(" ")) {
      search = await refineSearchWord(search);
    }

    setSearch(true);
    setPageNumber(0);
    setStaticSearchWord(search);
  };

  return (
    <div className="community">
      {!newPost && (
        <div className="content">
          {loginState && (
            <div className="post-btn">
              <Button
                title={"글쓰기"}
                handleClickEvent={() => setNewPost(true)}
              />
            </div>
          )}
          {posts.length < 1 ? (
            <NoticeNoContent message="아직 등록된 글이 없습니다" />
          ) : (
            <Posts posts={posts} />
          )}
          <Page
            amountOfPerPage={5}
            search={search}
            setSearch={setSearch}
            change={change}
            setChange={setChange}
            pageLength={pageLength}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
          />
          <form className="search" onSubmit={searching}>
            <Category
              categoryItems={categoryItems}
              changeHandler={(event: React.ChangeEvent<HTMLSelectElement>) =>
                setSearchCategory(event.target.value)
              }
            />
            <input
              className="search-input"
              onChange={(e) => {
                setSearchWord(e.target.value);
              }}
            ></input>
            <Button title={"검색"} type="submit" />
          </form>
        </div>
      )}
      {newPost && (
        <WritePost
          setNewPost={setNewPost}
          communityService={communityService}
        />
      )}
    </div>
  );
}

export default Community;
