import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { refineSearchWord } from "../util/search";

type Props = {
  searchWord: string;
  setSearchWord: React.Dispatch<React.SetStateAction<string>>;
};

function Search(props: Props) {
  let history = useHistory();
  let { searchWord, setSearchWord } = props;
  let [tempSearchWord, setTempSearchWord] = useState<string>("");

  const search = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!tempSearchWord || tempSearchWord.length > 50) {
      alert("검색어를 확인해 주세요");
      return;
    }

    let search = tempSearchWord.trim();
    let staticSearchWord = tempSearchWord.trim();
    if (search.includes(" ")) {
      search = await refineSearchWord(search);
    }
    setSearchWord(search);

    history.push(`/home/shop/search=${staticSearchWord}`);
  };

  useEffect(() => {
    if (searchWord.length <= 50) {
      return;
    }
    setTempSearchWord(tempSearchWord.slice(0, 50));
  }, [tempSearchWord]);

  useEffect(() => {}, [tempSearchWord]);

  return (
    <form className="home-search" onSubmit={search}>
      <input
        className="home-search-input"
        type="text"
        placeholder="search"
        value={tempSearchWord}
        onChange={(e) => setTempSearchWord(e.target.value)}
      ></input>
      <button type="submit" className="home-search-btn">
        <img
          src="/image/search.png"
          style={{ width: "20px" }}
          alt="search icon"
        ></img>
      </button>
    </form>
  );
}

export default Search;
