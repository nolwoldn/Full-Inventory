import React, { useState, useEffect, useRef } from "react";

interface passwordObject {
  password: string;
  passwordValid: boolean;
  passwordSelected: boolean;
}
interface validatingObject {
  validator: RegExp;
  message: string;
}

interface resendTimerObject {
  minuets: number;
  seconds: number;
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
  const [userEmailError, setUserEmailError] = useState<string>("");
  const [emailOTPPassed, setEmailOTPPassed] = useState<boolean>(false);
  const [resendTimer, setResendTimer] = useState<resendTimerObject>({
    minuets: 0,
    seconds: 0,
  });
  const [resendOTP, changeResendOTP] = useState<boolean>(false);

  //functions
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

    if (index < 9 && newVal !== "") {
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
    console.log(pastedChars);
    let newOtp = [...otpVals];
    pastedChars.forEach((char, idx) => {
      if (idx < pastedChars.length) newOtp[idx] = char;
    });
    changeOtp(newOtp);

    const focusIndex = Math.min(pastedChars.length, pastedData.length - 1);
    verifyInputRefs.current[focusIndex]?.focus();
  };

  function handleTiming() {
    let seconds: number = resendTimer.seconds;
    let minuets: number = resendTimer.minuets;
    let total: number = minuets * 60 + seconds;
    total -= 1;

    let minuetString = (total / 60).toString();
    minuets = parseInt(minuetString);
    seconds = Math.floor((parseFloat(minuetString) - minuets) * 60);
    setResendTimer({ minuets, seconds });
    console.log(`${resendTimer.minuets} : ${resendTimer.seconds}`);
  }

  const startResendTimer = () => {
    if (!showVerifyEmail || resendTimer.minuets * 60 + resendTimer.seconds > 0)
      return;

    setResendTimer({ minuets: 5, seconds: 0 });
    changeResendOTP(false);
    setInterval(() => {
      handleTiming();
    }, 1000);

    if (resendTimer.minuets * 60 + resendTimer.seconds === 0) {
      changeResendOTP(true);
    }
  };
  useEffect(() => {
    startResendTimer();
  }, [showVerifyEmail]);

  let resendOnClick = (e: React.MouseEvent) => {
    if (resendOTP) {
      SignupRequest(e);
      startResendTimer();
    } else {
    }
  };

  //backend functions

  let SignupRequest = async (e: React.MouseEvent) => {
    // TODO: finish post request
    e.preventDefault();
    let email = userEmail.current?.value;
    let password = userPassword.password;
    let confirmPassword = userConfirmPass.password;

    if (!email || !password || password !== confirmPassword) {
      setUserEmailError("Inputs not filled in correctly");
      return;
    }

    try {
      let response = await fetch("http://localhost:5000/api/verify/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setUserEmailError(data.cause);
        return;
      }
      setVerifyEmail(true);
    } catch (e) {
      console.log(
        `error ${e} happened while proccessing user signup submition`,
      );
    }
  };

  let verifyEmailRequest = async (e: React.MouseEvent) => {
    const combinedString: string = otpVals.join("");
    const email: string | undefined = userEmail.current?.value;
    const password: string = userPassword.password;
    const finalObject = {
      email: email,
      password: password,
      otp: combinedString,
    };

    if (combinedString.length !== 6) {
      setUserEmailError("OTP input not fufilled");
    }
    try {
      let response = await fetch("http://localhost:5000/api/verify/code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalObject),
      });

      let data = await response.json();
      console.log(data);
    } catch (e) {
      console.log(`Error ${e} occured while trying to verify otp`);
    }
  };

  return (
    <>
      <div className="signup-form-part">
        <div className="signup-content"></div>
        <div className="signup-form">
          <form className="sign-main-form">
            <label className="signup-labels" htmlFor="userEmail">
              Your Email
            </label>
            <input
              type="email"
              id="userEmail"
              className="signup-form-inputs"
              ref={userEmail}
              required
            />

            <label htmlFor="userPassword" className="signup-labels">
              Password
            </label>
            <input
              type="password"
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
              className="signup-form-inputs"
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
              type="password"
              className="signup-form-inputs"
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
            />
            {!userConfirmPass.passwordValid &&
              userConfirmPass.passwordSelected && (
                <p className="confrimpassword-no-match">
                  Passwords do not match
                </p>
              )}

            <button onClick={(e) => SignupRequest(e)} className="submit-signup">
              Sign
            </button>
          </form>
        </div>
      </div>

      {showVerifyEmail && (
        <div className="verify-email">
          <p className="verification-heading">
            We have sent a 5 digit code to {userEmail.current?.value} please
            fill out the form <br />
            and tap verify to show us this is your account
          </p>
          <div className="verify-inputs-wrapper">
            {otpVals.map((val: string, idx: number) => (
              <input
                key={idx}
                type="text"
                maxLength={2}
                className="verify-input"
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
          <div className="opt-card-bottom">
            <button className="verify-email" onClick={verifyEmailRequest}>
              Verify Email
            </button>
            <button className="resend-opt" onClick={resendOnClick}>
              Resend {resendTimer.minuets} : {resendTimer.seconds}
            </button>
          </div>
        </div>
      )}

      {userEmailError && (
        <div className="user-email-errors">{userEmailError}</div>
      )}
    </>
  );
}

export default Signup;
