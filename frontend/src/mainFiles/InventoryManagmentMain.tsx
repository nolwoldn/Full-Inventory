import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

interface linkStruct {
  name: string;
  link: string;
  class: string;
  element: React.ReactNode;
}

interface SidebarProps {
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
}

interface currentLinkObject {
  currentLink: String;
}

function InventoryPage() {
  const checkUserType = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/user-type", {
        method: "GET",
        credentials: "include",
      });
    } catch (e) {
      console.log("eror");
    }
  };
  return <></>;
}

function SideBar({ user }: SidebarProps) {
  const navigate = useNavigate();
  const crrLocation = useLocation();
  let LinkList: linkStruct[] = [
    {
      name: "Inventory",
      link: "/inventory/inventory",
      class: "sidebar-link",
      element: <InventoryPage />,
    },
  ];
  switch (user.userType) {
    case "unemployed":
      LinkList = [
        {
          name: "Create bussiness",
          link: "/inventory/create-bussniess",
          class: "sidebar-link",
          element: (
            <div className="width-100 display-flex justify-center">
              Sorry this page is in development
            </div>
          ),
        },
      ];
      if (crrLocation.pathname !== "/inventory/create-bussniess") {
        navigate("/inventory/create-bussniess");
      }
      break;
    case "admin":
      console.log("user is admin of company");
      LinkList = [
        ...LinkList,
        {
          name: "Dashboard",
          link: "/inventory/dashboard",
          class: "sidebar-link",
          element: (
            <div className="width-100 display-flex justify-center">
              Sorry this page is in development
            </div>
          ),
        },
        {
          name: "Sales",
          link: "/inventory/sales",
          class: "sidebar-link",
          element: (
            <div className="width-100 display-flex justify-center">
              Sorry this page is in development
            </div>
          ),
        },
        {
          name: "Buyers",
          link: "/inventory/buyers",
          class: "sidebar-link",
          element: (
            <div className="width-100 display-flex justify-center">
              Sorry this page is in development
            </div>
          ),
        },
        {
          name: "Add user",
          link: "/inventroy/add-user",
          class: "sidebar-link add-user",
          element: (
            <div className="width-100 display-flex justify-center">
              Sorry this page is in development
            </div>
          ),
        },
      ];
      break;
    case "worker":
      console.log("user is a worker");
      break;
    default:
      console.log("user type not identified");
      break;
  }
  return (
    <>
      {LinkList.length > 1 && (
        <div className="sidebar-full">
          <div className="sidebar-head">Inventory Managment</div>
          <div className="sidebar-main">
            {LinkList.map((item, idx: number) => (
              <NavLink
                key={idx}
                to={item.link}
                className={item.class}
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
      )}
    </>
  );
}

function Main({ currentLink }: currentLinkObject) {
  const navigate = useNavigate();
  const [userError, setUserError] = useState<userErrorObject>({
    fail: false,
    cause: "",
  });
  const sideBarLink = [
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
    { name: "Create bussiness", link: "/inventory/create-bussniess" },
  ];
  const currentFunction = sideBarLink.find((item) => item.link == currentLink);
  useEffect(() => {
    if (!currentFunction) {
      navigate("/pageNotFound", { replace: true });
    }
  }, [currentFunction, navigate]);

  const [user, setUser] = useState<userObject>({
    name: "",
    userType: "",
    organisation: null,
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
    getCrrUser();
  }, []);
  return (
    <div className="inventory-full">
      <SideBar user={user} />
      {userError.fail && (
        <div className="user-email-errors">{userError.cause}</div>
      )}
    </div>
  );
}

export default Main;
