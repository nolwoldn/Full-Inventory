import { useEffect, useRef, useState } from "react";
import csrfToken from "../index";
import { NavLink, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "devicon/devicon.min.css";

interface userErrorObject {
  fail: boolean;
  cause: string;
}

function Login() {
  useEffect(() => {
    document.title = "Login";
    csrfToken();
  }, []);

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

  return (
    <div className="login-full">
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
            className="login-inputs"
            placeholder="password123"
            ref={userPassword}
            required
          />
          {showPassword ? (
            <FontAwesomeIcon
              icon={faEyeSlash}
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <FontAwesomeIcon
              icon={faEye}
              onClick={() => setShowPassword(true)}
            />
          )}
        </div>

        <button className="login-submit" onClick={loginRequest}>
          Log in
        </button>
        <div className="login-bottom">
          <label className="remeber-me-label">
            Remeber me ?
            <input
              type="checkbox"
              ref={remeberUser}
              id="remeber-me"
              className="remeber-checkbox"
            />
          </label>
          <NavLink className="signup-link" to="/signup">
            Don't have an account
          </NavLink>
        </div>
      </div>
      <div className="login-content">;</div>
      {userError.fail && (
        <div className="user-email-errors">{userError.cause}</div>
      )}
    </div>
  );
}

export default Login;
