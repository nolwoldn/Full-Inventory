import { useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
} from "react-router-dom";

interface linkStruct {
  name: string;
  link: string;
}

function Routing() {
  const [crrLinkIdx, changeCrrLinkIdx] = useState<number>(-1);

  const sideBarLink: linkStruct[] = [
    {
      name: "Dashboard",
      link: "/",
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

  return (
    <>
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
            onMouseEnter={()=> changeCrrLinkIdx(idx)}
            onMouseLeave={()=> changeCrrLinkIdx(-1)}
          >
            {item.name}
          </NavLink>
        ))}
      </div>

      <Routes>

      </Routes>
    </>
  );
}

function Index() {
  return (
    <Router>
      <Routing />
    </Router>
  );
}

createRoot(document.getElementById("root")!).render(<Index />);
