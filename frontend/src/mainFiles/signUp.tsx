import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import "../css/signUp.css";
import csrfToken from "../index";
interface passwordObject {
  password: string;
  passwordValid: boolean;
  passwordSelected: boolean;
}
interface validatingObject {
  validator: RegExp;
  message: string;
}

interface userErrorObject {
  fail: boolean;
  cause: string;
}

const passWordValidationReg: validatingObject[] = [
  {
    validator: /^(?=.*[a-z])/,
    message: "You need to have lower case letters",
  },
  {
    validator: /^(?=.*[A-Z])/,
    message: "You need to have upper case letters",
  },
  {
    validator: /^(?=.*[0-9])/,
    message: "Their needs to be atleast one number",
  },
  {
    validator: /^.{8,30}/,
    message: "Your password must be 8-30 charcters long",
  },
];

function Signup() {
  useEffect(() => {
    csrfToken();

    document.title = "Sign up";
  }, []);
  //variables
  const userEmail = useRef<HTMLInputElement | null>(null);
  const [userPassword, changeUserPassword] = useState<passwordObject>({
    password: "",
    passwordValid: true,
    passwordSelected: false,
  });
  const [userConfirmPass, changeUserConfrimPassword] = useState<passwordObject>(
    {
      password: "",
      passwordValid: true,
      passwordSelected: false,
    },
  );
  const [userPasswordErrors, changeUserPasswordErrors] = useState<string[]>([
    "",
  ]);
  const [otpVals, changeOtp] = useState<string[]>(new Array(6).fill(""));
  const verifyInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [showVerifyEmail, setVerifyEmail] = useState<boolean>(false);
  const [userError, setUserError] = useState<userErrorObject>({
    fail: false,
    cause: "",
  });
  const [emailOTPPassed, setEmailOTPPassed] = useState<boolean | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(0);
  const [resendOTP, changeResendOTP] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  //functions
  const handleSuccsessfullSignup = () => {
    navigate("/login");
  };

  const checkPasswords = (confirmPass: string): boolean => {
    const isMatch = confirmPass === userPassword.password;
    return isMatch;
  };
  const validatePassword = (password: string): boolean => {
    let passWordErrors: string[] = [];
    for (let i of passWordValidationReg) {
      if (!i.validator.test(password)) {
        passWordErrors.push(i.message);
      }
    }
    changeUserPasswordErrors(passWordErrors);
    return !(passWordErrors.length > 0);
  };

  const handleOptChanges = (el: HTMLInputElement, index: number) => {
    let elVal = el.value;
    let newVal = elVal.substring(elVal.length - 1);
    let newOtp: string[] = [...otpVals];
    if (!elVal) {
      newOtp[index] = "";
      changeOtp(newOtp);
      return;
    }
    newOtp[index] = newVal;
    changeOtp(newOtp);

    if (index < otpVals.length && newVal !== "") {
      verifyInputRefs.current[index + 1]?.focus();
    }
  };
  const handleBackspaceOtp = (
    keyEvent: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (keyEvent.key === "Backspace" && !otpVals[index] && index > 0) {
      verifyInputRefs.current[index - 1]?.focus();
    }
    let newOtp: string[] = [...otpVals];
    newOtp[index] = "";
    changeOtp(newOtp);
  };

  const handleOtpPaste = (clipy: React.ClipboardEvent<HTMLInputElement>) => {
    clipy.preventDefault(); // stops the browser from putting it into an input of size two and losing the rest
    const pastedData = clipy.clipboardData.getData("text").trim(); //gets the data from the clipboard and trims it
    const pastedChars = pastedData.slice(0, pastedData.length).split(""); //separates it into a list of 5 chars with

    let newOtp = [...otpVals];
    pastedChars.forEach((char, idx) => {
      if (idx < pastedChars.length) newOtp[idx] = char;
    });
    changeOtp(newOtp);

    const focusIndex = Math.min(pastedChars.length, pastedData.length - 1);
    verifyInputRefs.current[focusIndex]?.focus();
  };

  const startResendTimer = () => {
    if (!showVerifyEmail || resendTimer > 0 || resendOTP) return;

    setResendTimer(60);
    changeResendOTP(false);
    let interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    if (resendTimer === 0) {
      changeResendOTP(true);
    }
    return interval;
  };
  useEffect(() => {
    let interv = startResendTimer();
    return () => clearInterval(interv);
  }, [showVerifyEmail === true]);

  let resendOnClick = (e: React.MouseEvent) => {
    if (resendOTP) {
      SignupRequest(e);
      startResendTimer();
    } else {
    }
  };

  let startUserErrorTimer = () => {
    let timer = setTimeout(() => {
      setUserError({ fail: false, cause: "" });
    }, 5000);
    return () => clearTimeout(timer);
  };

  //backend functions

  let SignupRequest = async (e: React.MouseEvent) => {
    // TODO: finish post request
    e.preventDefault();
    let email = userEmail.current?.value;
    let password = userPassword.password;
    let confirmPassword = userConfirmPass.password;

    if (!email || !password || password !== confirmPassword) {
      setUserError({ fail: true, cause: "inputs filled in incorrectly" });
      startUserErrorTimer();
      return;
    }
    if (resendTimer) {
      setUserError({ fail: true, cause: "You have already sent request" });
      startUserErrorTimer();
      return;
    }

    try {
      let response = await fetch("http://localhost:5000/api/verify/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setUserError({ fail: true, cause: data.cause });
        startUserErrorTimer();
        return;
      }
      setVerifyEmail(true);
    } catch (e) {
      console.log(
        `error ${e} happened while proccessing user signup submition`,
      );
    }
  };

  let googleSuccsess = async (credentialResponse: CredentialResponse) => {
    try {
      let response = await fetch("http://localhost:5000/api/signup/google", {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",

        method: "POST",
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();

      if (!response.ok) {
        setUserError({ fail: true, cause: data.cause });
        startUserErrorTimer();
        return;
      }
      handleSuccsessfullSignup();
    } catch (e) {
      throw new Error(`Error ${e} from google fetch`);
    }
  };
  let googleFail = () => {
    setUserError({ fail: true, cause: "A google sign up error occured" });
    startUserErrorTimer();
    console.log("A google error");
  };

  let verifyEmailRequest = async () => {
    const combinedString: string = otpVals.join("");
    const email: string | undefined = userEmail.current?.value;
    const password: string = userPassword.password;
    const finalObject = {
      email: email,
      password: password,
      otp: combinedString,
    };

    if (combinedString.length !== otpVals.length) {
      setUserError({ fail: true, cause: "otp inputs not filled in" });
      startUserErrorTimer();
    }
    try {
      let response = await fetch("http://localhost:5000/api/verify/code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",

        body: JSON.stringify(finalObject),
      });

      let data = await response.json();
      setEmailOTPPassed(data.succsess);
      if (data.succsess) {
        handleSuccsessfullSignup();
      }
    } catch (e) {
      console.log(`Error ${e} occured while trying to verify otp`);
    }
  };

  return (
    <div className="signup-full">
      <div className="signup-form-part">
        <div className="signup-content">;</div>
        <div className="signup-form">
          <form className="sign-main-form">
            <h1 className="sign-form-heading">Get started</h1>
            <label className="signup-labels" htmlFor="userEmail">
              Email address
            </label>
            <input
              type="email"
              id="userEmail"
              className={
                userError.fail
                  ? "signup-form-inputs border-red"
                  : "signup-form-inputs"
              }
              ref={userEmail}
              placeholder="Enter your email"
              required
            />

            <label htmlFor="userPassword" className="signup-labels">
              Password
            </label>
            <input
              type={showPassword ? "type" : "password"}
              id="userPassword"
              onChange={(e) => {
                changeUserPassword({
                  password: e.target.value,
                  passwordValid: validatePassword(e.target.value),
                  passwordSelected: userPassword.passwordSelected,
                });
              }}
              onBlur={(e) => {
                changeUserPassword({
                  password: e.target.value,
                  passwordValid: userPassword.passwordValid,
                  passwordSelected: false,
                });
              }}
              onFocus={(e) => {
                changeUserPassword({
                  password: e.target.value,
                  passwordValid: userPassword.passwordValid,
                  passwordSelected: true,
                });
              }}
              className={
                userError.fail
                  ? "signup-form-inputs border-red"
                  : "signup-form-inputs"
              }
              placeholder="Your password"
              required
            />
            {!userPassword.passwordValid && userPassword.passwordSelected && (
              <div className="user-password-errors">
                {userPasswordErrors.map((value, idx) => (
                  <p className="user-password-error-txt" key={idx}>
                    {value}
                  </p>
                ))}
              </div>
            )}
            <label htmlFor="userCPass" className="signup-labels">
              Confirm password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              className={
                !userConfirmPass.passwordValid &&
                userConfirmPass.passwordSelected
                  ? "signup-form-inputs confirm-password-error"
                  : "signup-form-inputs"
              }
              style={{
                borderColor: userError.fail ? "red" : "black",
                borderWidth: userError.fail ? "2px" : "1px",
              }}
              onChange={(e) => {
                changeUserConfrimPassword({
                  password: e.target.value,
                  passwordValid: checkPasswords(e.target.value),
                  passwordSelected: true,
                });
              }}
              onBlur={(e) => {
                changeUserConfrimPassword({
                  password: e.target.value,
                  passwordValid: checkPasswords(e.target.value),
                  passwordSelected: false,
                });
              }}
              required
              placeholder="Confirm your password"
            />
            {!userConfirmPass.passwordValid &&
              userConfirmPass.passwordSelected && (
                <p className="confrimpassword-no-match">
                  Passwords do not match
                </p>
              )}

            <button onClick={(e) => SignupRequest(e)} className="submit-signup">
              Create account
            </button>
          </form>
          <div className="signup-bottom">
            <div className="signup-bottom-left">
              <label
                htmlFor="show-password-signup"
                className="show-password-label"
              >
                Show Password
              </label>
              <input
                type="checkbox"
                id="show-password-signup"
                className="show-passwords-signup"
                onChange={(e) => setShowPassword(e.target.checked)}
              />
            </div>
            <NavLink className="signup-links" to={"/login"}>
              Have an account?
            </NavLink>
          </div>
          <div
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <GoogleLogin
              onSuccess={googleSuccsess}
              onError={googleFail}
              text="signup_with"
              shape="rectangular"
              width="100px"
              size="large"
            />
          </div>
        </div>
      </div>

      {showVerifyEmail && (
        <div className="verify-email">
          <p className="verification-heading">
            We have sent a 6 digit code to {userEmail.current?.value} please
            veirfy your account
          </p>
          <div className="verify-inputs-wrapper">
            {otpVals.map((val: string, idx: number) => (
              <input
                key={idx}
                type="text"
                maxLength={2}
                className={
                  userError.fail ? "verify-input border-red" : "verify-input"
                }
                style={{
                  borderColor: (() => {
                    switch (emailOTPPassed) {
                      case true:
                        return "rgb(0 255 0)";
                      case null:
                        return "black";
                      case false:
                        return "red";
                    }
                  })(),
                }}
                value={val}
                ref={(el) => {
                  verifyInputRefs.current[idx] = el;
                }}
                onChange={(e) => handleOptChanges(e.target, idx)}
                onKeyDown={(e) => handleBackspaceOtp(e, idx)}
                onPaste={handleOtpPaste}
              />
            ))}
          </div>
          <div className="otp-card-bottom">
            <button
              className="verify-email-button"
              onClick={verifyEmailRequest}
            >
              Verify Email
            </button>
            <button className="resend-otp" onClick={resendOnClick}>
              Resend {parseInt((resendTimer / 60).toString())} :{" "}
              {Math.floor(
                (resendTimer / 60 - parseInt((resendTimer / 60).toString())) *
                  60,
              )}
            </button>
          </div>
        </div>
      )}

      {userError.fail && (
        <div className="user-email-errors">{userError.cause}</div>
      )}
    </div>
  );
}

export default Signup;
