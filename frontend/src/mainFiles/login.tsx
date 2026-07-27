import { useEffect, useRef, useState } from "react";
import indexFunctions from "../index";
import { NavLink, useNavigate } from "react-router-dom";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "../css/login.css";

interface userErrorObject {
  fail: boolean;
  cause: String;
}
interface LoggedInStruct {
  fail: boolean;
  pass: boolean;
  cause: String;
}

function Login() {
  indexFunctions.csrfToken();

  let userEmail = useRef<null | HTMLInputElement>(null);
  let userPassword = useRef<null | HTMLInputElement>(null);
  let remeberUser = useRef<null | HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
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
      console.log("login check failed");

      return;
    }
    console.log("Navigating to the dashboard");
    navigate("/dashboard");
  };
  checkLogin();

  let loginRequest = async (e: React.MouseEvent) => {
    e.preventDefault();

    const email = userEmail.current?.value;
    const password = userPassword.current?.value;
    const remeber = remeberUser.current?.checked;

    if (!email || !password) {
      setUserError({ fail: true, cause: "YOu havenet filled in all inputs" });
      startUserErrorTimer();
      return;
    }

    try {
      let response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          remeber,
        }),
      });
      let data = await response.json();

      if (!response.ok) {
        setUserError({ fail: true, cause: data.cause });
        startUserErrorTimer();
        return;
      }
      navigate("/dashboard");
    } catch (e) {
      throw new Error(`Error ${e} happned during login`);
    }
  };

  const googleSuccsess = async (e: CredentialResponse) => {
    const remeber = remeberUser.current?.checked;
    try {
      let response = await fetch("http://localhost:5000/api/login/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ token: e.credential, remeber }),
      });
      let data = await response.json();
      if (!response.ok) {
        setUserError({ cause: data.cause, fail: true });
        startUserErrorTimer();
        return;
      }
      navigate("/dashboard");
    } catch (e) {
      setUserError({ fail: true, cause: `Error ${e} happned` });
      startUserErrorTimer();
      return;
    }
  };
  const googleFail = () => {
    setUserError({ fail: true, cause: "Google Error" });
    startUserErrorTimer();
  };

  useEffect(() => {
    document.title = "Login";
  }, []);
  return (
    <div className="login-full">
      <div className="login-main">
        <div className="login-form">
          <h1>Welcome back</h1>
          <label className="login-labels" htmlFor="email">
            Your Email
          </label>
          <input
            className="login-inputs"
            id="email"
            placeholder="Email"
            type="text"
            ref={userEmail}
            required
          />
          <label htmlFor="password" className="login-labels">
            Your password
          </label>
          <div className="password-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="login-inputs login-password-input"
              placeholder="Password"
              ref={userPassword}
              required
            />
            {showPassword ? (
              <FontAwesomeIcon
                icon={faEyeSlash}
                onClick={() => setShowPassword(false)}
                className="show-password-eye"
              />
            ) : (
              <FontAwesomeIcon
                icon={faEye}
                onClick={() => setShowPassword(true)}
                className="show-password-eye"
              />
            )}
          </div>

          <button className="login-submit" onClick={loginRequest}>
            Log in
          </button>
          <div className="login-bottom">
            <label className="remeber-me-label">
              Remeber me?
              <input
                type="checkbox"
                ref={remeberUser}
                id="remeber-me"
                className="remeber-checkbox"
              />
            </label>
            <NavLink className="signup-link" to="/signup">
              Don't have an account?
            </NavLink>
          </div>
          <div className="google-login-wrapper">
            <GoogleLogin
              onSuccess={googleSuccsess}
              onError={googleFail}
              shape="rectangular"
              width="100px"
              size="large"
            />
          </div>
        </div>
        <div className="login-content">;</div>
        {userError.fail && (
          <div className="user-email-errors">{userError.cause}</div>
        )}
      </div>
    </div>
  );
}

export default Login;
