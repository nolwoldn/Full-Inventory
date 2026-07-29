import { useState } from "react";
import indexFunctions from "../index";
import { useNavigate } from "react-router-dom";

interface LoggedInStruct {
  fail: boolean;
  pass: boolean;
  cause: String;
}
interface userErrorObject {
  fail: boolean;
  cause: String;
}

function LandingPage() {
  const [userError, setUserError] = useState<userErrorObject>({
    fail: false,
    cause: "",
  });
  const navigate = useNavigate();

  let startUserErrorTimer = () => {
    let timer = setTimeout(() => {
      setUserError({ fail: false, cause: "" });
    }, 5000);
    return () => clearTimeout(timer);
  };
  const checkLogin = async () => {
    const loggedIn: LoggedInStruct = await indexFunctions.askLogin();
    if (loggedIn.fail) {
      setUserError({ fail: true, cause: loggedIn.cause });
      startUserErrorTimer();
      return;
    }
    if (!loggedIn.pass) {
      return;
    }
    console.log("Navigating to the dashboard");
    navigate("/dashboard");
  };
  checkLogin();

  return (
    <>
      <div className="landing-full">
        <div className="hero-page">
            
        </div>
        {userError.fail && (
          <div className="user-email-errors">{userError.cause}</div>
        )}
      </div>
    </>
  );
}

export default LandingPage;
