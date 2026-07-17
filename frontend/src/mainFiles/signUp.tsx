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
  const [otpVals, changeOtp] = useState<string[]>(new Array(5).fill(""));
  const verifyInputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

    if (index < 4 && newVal !== "") {
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
    const pastedChars = pastedData.slice(0, 5).split(""); //separates it into a list of 5 chars with
    let newOtp = [...otpVals];
    pastedChars.forEach((char, idx) => {
      if (idx < 5) newOtp[idx] = char;
    });
    changeOtp(newOtp);

    const focusIndex = Math.min(pastedChars.length, 4);
    verifyInputRefs.current[focusIndex]?.focus();
  };

  //backend functions

  let resSignup = async () => {
    let email = userEmail.current?.value;
    let password = userPassword.password;

    let packagedResponse = {
      email,
      password,
    };

    let response = await fetch("http://localhost:5000/api/verifyEmail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(packagedResponse),
    });
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

            <button className="submit-signup">Sign</button>
          </form>
        </div>
      </div>

      <div className="verify-email">
        <p className="verification-heading">
          We have sent a 5 digit code to {userEmail.current?.value} please fill out the form{" "}
          <br />
          and tap verify to show us this is your account
        </p>
        <div className="verify-inputs-wrapper">
          {otpVals.map((val: string, idx: number) => (
            <input
              key={idx}
              type="text"
              inputMode="numeric"
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
        <button className="verify-email">Verify Email</button>
      </div>
    </>
  );
}

export default Signup;
