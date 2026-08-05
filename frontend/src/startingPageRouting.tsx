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
    navigate("/inventory/inventory");
  };
  checkLogin();

  return (
    <h1 className="width-100 display-flex justify-center">
      Hello please wait while we are asseing if your logged in
    </h1>
  );
}

export default StartingPage;
