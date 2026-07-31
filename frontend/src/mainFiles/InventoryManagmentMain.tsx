import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

interface linkStruct {
  name: string;
  link: string;
}

interface SidebarProps {
  LinkList: linkStruct[];
  user: userObject;
}
interface userErrorObject {
  fail: boolean;
  cause: String;
}
interface userObject {
  name: String;
  userType: String;
  organisation: null | String;
  authorization: null | String;
}

interface currentLinkObject {
  currentLink: String;
}

function SideBar({ LinkList, user }: SidebarProps) {
  return (
    <div className="sidebar-full">
      <div className="sidebar-head">Inventory Managment</div>
      <div className="sidebar-main">
        {LinkList.map((item, idx: number) => (
          <NavLink
            key={idx}
            to={item.link}
            className="sidebar-link"
            style={({ isActive }) => ({
              background: isActive
                ? "linear-gradient( 90deg, rgb(199, 225, 241), rgba(28, 25, 103, 0.35) )"
                : "",
              color: isActive ? "black" : "white",
            })}
          >
            {item.name}
          </NavLink>
        ))}
        <div className="sidebar-bottom"></div>
      </div>
    </div>
  );
}

function Main({ currentLink }: currentLinkObject) {
  const navigate = useNavigate();
  const [userError, setUserError] = useState<userErrorObject>({
    fail: false,
    cause: "",
  });
  const sideBarLink: linkStruct[] = [
    {
      name: "Dashboard",
      link: "/inventory/dashboard",
    },
    {
      name: "Inventory",
      link: "/inventory/inventory",
    },
    {
      name: "Sales",
      link: "/inventory/sales",
    },
    {
      name: "Buyers",
      link: "/inventory/buyers",
    },
  ];
  const currentFunction = sideBarLink.find((item) => item.link == currentLink);
  if (!currentFunction) {
    navigate("/pageNotFound");
 
  }
  const [user, setUser] = useState<userObject>({
    name: "",
    userType: "",
    organisation: "",
    authorization: "",
  });
  let startUserErrorTimer = () => {
    let timer = setTimeout(() => {
      setUserError({ fail: false, cause: "" });
    }, 5000);
    return () => clearTimeout(timer);
  };
  useEffect(() => {
    const getCrrUser = async () => {
      const response = await fetch("http://localhost:5000/api/get-user", {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        setUserError({ fail: true, cause: data.cause });
        startUserErrorTimer();
        return;
      }
      setUser(data.user);
    };
  }, []);
  return (
    <div className="inventory-full">
      <SideBar LinkList={sideBarLink} user={user} />
      {userError.fail && (
        <div className="user-email-errors">{userError.cause}</div>
      )}
    </div>
  );
}

export default Main;
