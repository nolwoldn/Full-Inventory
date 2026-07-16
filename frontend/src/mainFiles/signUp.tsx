import React, { useState, useEffect, useRef } from "react";

interface passwordObject {
  password: string;
  passwordValid: boolean;
  passwordSelected: boolean;
}
interface validatingObject {
  validator: string;
  message: string;
}

function Signup() {
  useEffect(() => {
    document.title = "Sign up";
  }, []);

  const userEmail = useRef(null);
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

  const [userPasswordErrors, changeUserPasswordErrors] = useState<string[]>([]);

  const passWordValidationReg: validatingObject[] = [
    {
      validator: "(?=.*[a-z])",
      message: "You need to have lower case letters",
    },
    {
      validator: "(?=.*[A-}Z])",
      message: "You need to have upper case letters",
    },
    { validator: "(?=.*[0-9])", message: "You need to have numbers" },
    {
      validator: ".{8,30}",
      message: "Your password must be 8-30 charcters long",
    },
  ];

  const checkPasswords = (confirmPass: string): boolean => {
    const isMatch = confirmPass === userPassword.password;
    return isMatch;
  };

  const validatePassword = (): boolean => {
    let passWordErrors: string[] = [];
    for (let i of passWordValidationReg) {
      if (!i.validator.match(userPassword.password)) {
        passWordErrors.push(i.message);
      }
    }
    changeUserPasswordErrors(passWordErrors);
    return passWordErrors.length > 0;
  };
  return (
    <div className="signup-full">
      <div className="full-signup">
        <div className="signup-content"></div>
        <div className="signup-form">
          <form className="sign-main-form">
            <label className="signup-labels" htmlFor="userEmail">
              Your Email
            </label>
            <input
              type="text"
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
                  passwordValid: validatePassword(),
                  passwordSelected: true,
                });
              }}
              onBlur={(e) => {
                changeUserPassword({
                  password: e.target.value,
                  passwordValid: validatePassword(),
                  passwordSelected: false,
                });
              }}
              className="signup-form-inputs"
              required
            />
            {userPassword.passwordSelected && !userPassword.passwordValid && (
              <div className="password-errors"></div> // TODO: add the system for showing errors
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
            {/* add system for knowing wheather cPass is same as pass */}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
