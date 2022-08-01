import { useEffect, useState } from "react";

type Props = {
  amountOfPerPage: number;
  search?: boolean;
  setSearch?: React.Dispatch<React.SetStateAction<boolean>>;
  change: boolean;
  setChange: React.Dispatch<React.SetStateAction<boolean>>;
  pageLength: number;
  pageNumber: number;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
};

function Page(props: Props) {
  let [paging, setPaging] = useState<number[][]>([]);
  let [nextPage, setNextPage] = useState<number>(0);
  let [skipNextPage, setSkipNextPage] = useState<boolean>(true);
  let [prevOrNext, setPrevOrNext] = useState<"prev" | "next" | "">("");

  let {
    amountOfPerPage,
    search,
    setSearch,
    change,
    setChange,
    pageLength,
    pageNumber,
    setPageNumber,
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
    if (change) {
      const temp1 = Array.from({ length: pageLength }, (_, i) => Number(i + 1));

      let temp2: number[][] = [];
      for (let i = 0; i < pageLength / amountOfPerPage; i++) {
        temp2.push(temp1.slice(i * amountOfPerPage, (i + 1) * amountOfPerPage));
      }

      if (search && setSearch) {
        setNextPage(0);
        setSearch(false);
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

        setChange(false);
        return;
      }

      setPaging(temp2);
      setChange(false);
    }
  }, [change]);

  return (
    <div className="page">
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
                `pageNum ${item == pageNumber ? "clickedPageNum" : ""}`
                // item == pageNumber ? "pageNum clickedPageNum" : "pageNum"
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
  );
}

export default Page;
