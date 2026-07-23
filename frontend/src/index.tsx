import { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import googleClientItems from "../../googleClient.json";
import Signup from "./mainFiles/signUp";
import Login from "./mainFiles/login";

interface linkStruct {
  name: string;
  link: string;
}

function Routing() {
  const crrLocation = useLocation();
  const [crrLinkIdx, changeCrrLinkIdx] = useState<number>(-1);

  let showSideBar: boolean = false;

  const sideBarLink: linkStruct[] = [
    {
      name: "Dashboard",
      link: "/dashboard",
    },
    {
      name: "Inventory",
      link: "inventory/",
    },
    {
      name: "Sales",
      link: "sales/",
    },
    {
      name: "Buyers",
      link: "buyers/",
    },
  ];

  showSideBar = sideBarLink.some((link) => link.link === crrLocation.pathname);

  return (
    <>
      {showSideBar && (
        <div className="side-bar">
          {sideBarLink.map((item, idx: number) => (
            <NavLink
              key={idx}
              to={item.link}
              className={({ isActive }) => {
                isActive || crrLinkIdx === idx
                  ? "interacted-with sidebar-link"
                  : "sidebar-link";
              }}
              onMouseEnter={() => changeCrrLinkIdx(idx)}
              onMouseLeave={() => changeCrrLinkIdx(-1)}
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      )}

      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}

function Index() {
  return (
    <GoogleOAuthProvider
      clientId={googleClientItems.web.client_id}
    >
      <Router>
        <Routing />
      </Router>
    </GoogleOAuthProvider>
  );
}

createRoot(document.getElementById("root")!).render(<Index />);
