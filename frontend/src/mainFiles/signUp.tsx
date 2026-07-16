import React,{ useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

interface confirmPassObject {
  passMatch: boolean;
  selected: boolean;
}

interface validatingObject {
  validator: string;
  message: string;
}

function Signup() {
  useEffect(() => {
    document.title = "Sign up";
  }, []);

  const userEmail = useRef("");
  const userPassword  = useRef("")
  const userConfirmPass  = useRef("");

  const [passwordsMatch, changeisMatch] = useState<confirmPassObject>({
    passMatch: true,
    selected: false,
  });
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

  const checkPasswords = (): void => {
    const isMatch = userConfirmPass.current === userPassword.current;

    changeisMatch({ passMatch: isMatch, selected: passwordsMatch.selected });
  };

  const validatePassword = () : void => {
    for (let i of passWordValidationReg) {
     
      let passWordErrors: string[] = [];
      if (!i.validator.match(userPassword.current)) {
        passWordErrors.push(i.message);
      }

      if (passWordErrors.length > 0) {
        changeUserPasswordErrors(passWordErrors);
      }
    }
  };

  return (
    <div className="sign-up-full">
      <div className="sign-up-form">
        
      </div>
    </div>
  );
}

export default Signup;
