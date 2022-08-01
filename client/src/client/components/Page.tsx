import { useEffect, useState } from "react";

type Props = {
  amountOfPerPage: number;
  change: boolean;
  setChange: React.Dispatch<React.SetStateAction<boolean>>;
  pageLength: number;
  pageNumber: number;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  newComment?: boolean;
  setNewComment?: React.Dispatch<React.SetStateAction<boolean>>;
  search?: boolean;
  setSearch?: React.Dispatch<React.SetStateAction<boolean>>;
};

function Page(props: Props) {
  let [paging, setPaging] = useState<number[][]>([]);
  let [nextPage, setNextPage] = useState<number>(0);
  let [skipNextPage, setSkipNextPage] = useState<boolean>(true);
  let [prevOrNext, setPrevOrNext] = useState<"prev" | "next" | "">("");
  const {
    change,
    setChange,
    pageLength,
    pageNumber,
    setPageNumber,
    newComment,
    setNewComment,
    search,
    setSearch,
  } = props;

  useEffect(() => {
    if (skipNextPage) {
      setSkipNextPage(false);
    } else if (prevOrNext === "prev") {
      const num: number | undefined = paging[nextPage].pop();

      if (num) {
        setPageNumber(num);
        setPrevOrNext("");
      }
    } else if (prevOrNext === "next") {
      setPageNumber(paging[nextPage][0]);
      setPrevOrNext("");
    }
  }, [nextPage]);

  useEffect(() => {
    if (prevOrNext) {
      if (prevOrNext === "prev") {
        setNextPage((currPage) => currPage - 1);
      } else if (prevOrNext === "next") {
        setNextPage((currPage) => currPage + 1);
      }
    }
  }, [prevOrNext]);

  useEffect(() => {
    if (change || search) {
      const temp1 = Array.from({ length: pageLength }, (_, i) => Number(i + 1));

      let temp2: number[][] = [];
      for (let i = 0; i < pageLength / 5; i++) {
        temp2.push(temp1.slice(i * 5, (i + 1) * 5));
      }

      if (search && setSearch) {
        setNextPage(0);
        setPaging(temp2);
        setSearch(false);
        setChange(false);
        return;
      }

      if (newComment && setNewComment && pageLength > pageNumber) {
        let p = Math.floor(pageLength / 5);
        if (pageLength % 5 === 0) {
          p -= 1;
        }
        setNextPage(p);
        setPaging(temp2);
        setPageNumber(pageLength);
        setNewComment(false);
        setChange(false);
        return;
      }

      if (pageLength < pageNumber) {
        const find = temp2.find((p) => p.find((n) => n === pageLength));

        if (find) {
          const idx = temp2.indexOf(find);

          if (nextPage === idx) {
            setPageNumber(pageLength);
          } else {
            setPrevOrNext("prev");
          }
        }

        setPaging(temp2);
        setChange(false);
        return;
      }
      setPaging(temp2);
      setChange(false);
    }
  }, [change]);

  return (
    <div className="page">
      <div className="original">
        {nextPage > 0 && (
          <span
            className="move-page"
            onClick={() => {
              setPrevOrNext("prev");
            }}
          >
            {"<"}
          </span>
        )}
        {paging[nextPage] &&
          paging[nextPage].map((item) => {
            return (
              <span
                className={
                  item == pageNumber ? "pageNum clickedPageNum" : "pageNum"
                }
                onClick={() => {
                  setPageNumber(item);
                }}
              >
                {item}
              </span>
            );
          })}
        {paging.length > 1 && nextPage + 1 < paging.length ? (
          <span
            className="move-page"
            onClick={() => {
              setPrevOrNext("next");
            }}
          >
            {">"}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default Page;
