import { useEffect } from "react";
import { useHistory } from "react-router-dom";

function Main() {
  let history = useHistory();

  useEffect(() => {
    history.push("/home");
  }, []);

  return null;
}

export default Main;
