import { useNavigate } from "react-router-dom";
import indexFunctions from "./index";

interface LoggedInStruct {
  fail: boolean;
  pass: boolean;
  cause: String;
}

function StartingPage() {
  const navigate = useNavigate();
  const checkLogin = async () => {
    const loggedIn: LoggedInStruct = await indexFunctions.askLogin();
    if (loggedIn.fail) {
      return;
    }
    if (!loggedIn.pass) {
      navigate("/home");
      return;
    }
    console.log("Navigating to the dashboard");
    navigate("/dashboard");
  };
  checkLogin();

  return (
    <h1
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      Hello please wait while we are asseing if your logged in
    </h1>
  );
}

export default StartingPage;
