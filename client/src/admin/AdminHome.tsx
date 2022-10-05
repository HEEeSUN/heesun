import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import "./AdminHome.css";

function AdminHome() {
  let history = useHistory();

  useEffect(() => {
    history.push("/admin/home");
  }, []);

  return null;
}

export default AdminHome;
