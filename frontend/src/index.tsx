import { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Signup from "./mainFiles/signUp";
import Login from "./mainFiles/login";
import StartingPage from "./startingPageRouting";
import LandingPage from "./mainFiles/landingPage";
import Main from "./mainFiles/InventoryManagmentMain";
import Page404 from "./mainFiles/notFoundPage";

import "./css/inventory-left.css";

const googleClientID: string = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientID) {
  console.log("missing google client id");
}
interface linkStruct {
  name: string;
  link: string;
}
interface LoggedInStruct {
  fail: boolean;
  pass: boolean;
  cause: String;
}
interface userErrorObject {
  fail: boolean;
  cause: String;
}

async function csrfToken() {
  try {
    let response = await fetch("http://localhost:5000/api/csrf-token", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("CSRF_TOKEN Failure");
    }
  } catch (e) {
    throw new Error(`Error ${e} while getting the csrf_token`);
  }
}

async function askLogin(): Promise<LoggedInStruct> {
  try {
    const response = await fetch("http://localhost:5000/api/ask/login", {
      method: "GET",
      credentials: "include",
    });
    const data = await response.json();
    if (!response.ok) {
      console.log("response given was failure");
      return { fail: true, cause: data.cause, pass: false };
    }
    return { fail: false, pass: data.pass, cause: "User logged in" };
  } catch (e) {
    console.log("login error");
    return { fail: true, cause: `Error ${e}`, pass: false };
  }
}

function Routing() {
  const navitgate = useNavigate();
  const crrLocation = useLocation();
  const [userError, setUserError] = useState<userErrorObject>({
    fail: false,
    cause: "",
  });

  let showSideBar: boolean = false;

  const sideBarLink: linkStruct[] = [
    {
      name: "Dashboard",
      link: "/dashboard",
    },
    {
      name: "Inventory",
      link: "/inventory",
    },
    {
      name: "Sales",
      link: "/sales",
    },
    {
      name: "Buyers",
      link: "/buyers",
    },
  ];

  showSideBar = sideBarLink.some((link) => link.link === crrLocation.pathname);
  let startUserErrorTimer = () => {
    let timer = setTimeout(() => {
      setUserError({ fail: false, cause: "" });
    }, 5000);
    return () => clearTimeout(timer);
  };

  if (showSideBar) {
    const checkLogin = async () => {
      const loggedIn: LoggedInStruct = await askLogin();
      if (loggedIn.fail) {
        setUserError({ fail: true, cause: loggedIn.cause });
        startUserErrorTimer();
        return;
      }
      if (!loggedIn.pass) {
        navitgate("/home");

        return;
      }
    };
    checkLogin();
  }
  return (
    <>
      <Routes>
        <Route path="/" element={<StartingPage />}></Route>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<LandingPage />} />
        {sideBarLink.map((item, idx) => (
          <Route key={idx} path={item.link} element={Main(sideBarLink)} />
        ))}
        <Route path="*" element={<Page404 />} />
      </Routes>
    </>
  );
}

function Index() {
  return (
    <GoogleOAuthProvider clientId={googleClientID}>
      <Router>
        <Routing />
      </Router>
    </GoogleOAuthProvider>
  );
}

createRoot(document.getElementById("root")!).render(<Index />);

export default { csrfToken, askLogin };
