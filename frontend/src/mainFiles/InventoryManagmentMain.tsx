import { useState } from "react";
import { NavLink } from "react-router-dom";

interface linkStruct {
  name: string;
  link: string;
}
interface userErrorObject {
  fail: boolean;
  cause: String;
}

function Main(LinkList: linkStruct[]) {
  const [userError, setUserError] = useState<userErrorObject>({
    fail: false,
    cause: "",
  });
  return (
    <div className="inventory-full">
      <div className="sidebar-full">
        <div className="sidebar-head">Inventory Managment</div>
        <div className="sidebar-main">
          {LinkList.map((item, idx: number) => (
            <NavLink
              key={idx}
              to={item.link}
              className="sidebar-link"
              style={({ isActive }) => ({
                backgroundColor: isActive ? "rgba(13, 11, 87, 0.38)" : "black",
                color: isActive ? "black" : "white",
              })}
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>
      {userError.fail && (
        <div className="user-email-errors">{userError.cause}</div>
      )}
    </div>
  );
}

export default Main;
