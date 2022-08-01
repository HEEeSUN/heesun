import { useEffect } from "react";
import Button from "../../../components/Button";

type Props = {
  setPrevDate: React.Dispatch<React.SetStateAction<string>>;
  setDate: React.Dispatch<React.SetStateAction<string>>;
  dateSearch: () => void;
  setSkip: React.Dispatch<React.SetStateAction<boolean>>;
};
function DateSearchBar(props: Props) {
  const offset = new Date().getTimezoneOffset() * 60000;
  const curr = new Date(Date.now() - offset);
  let today = curr.toISOString().substr(0, 10);
  curr.setFullYear(curr.getFullYear() - 1);
  curr.setDate(curr.getDate() + 1);
  const lastyear = curr.toISOString().substr(0, 10);
  const { setPrevDate, setDate, dateSearch, setSkip } = props;

  useEffect(() => {
    setPrevDate(lastyear);
    setDate(today);
    setSkip(false);
  }, []);

  return (
    <div className="search">
      <input
        type="date"
        className="search-date"
        defaultValue={lastyear}
        max={today}
        onChange={(e) => setPrevDate(e.target.value)}
      ></input>
      <span> ~ </span>
      <input
        type="date"
        className="search-date"
        defaultValue={today}
        min={lastyear}
        onChange={(e) => setDate(e.target.value)}
      ></input>
      <Button title={"검색"} handleClickEvent={dateSearch} />
    </div>
  );
}

export default DateSearchBar;
