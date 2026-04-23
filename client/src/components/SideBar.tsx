import { FaArrowRight, FaUser, FaHome, FaUserEdit } from "react-icons/fa";
import { MdBusiness, MdSettings } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const teamId = localStorage.getItem("teamId");

  const handleNavigation = (path: string) => {
    if (path === "/organizationchange" || path === "/usermangement") {
      if (!teamId) {
        alert("No teamId found. Please login again.");
        navigate("/");
        return;
      }

      navigate(`${path}/${teamId}`);
      return;
    }

    navigate(path);
  };

  const menu = [
    { icon: <FaHome className="w-4 h-4" />, path: "/dashboard" },
    { icon: <FaUser className="w-4 h-4" />, path: "/inviteuser" },
    { icon: <MdBusiness className="w-4 h-4" />, path: "/organizationchange" },
    { icon: <FaUserEdit className="w-4 h-4" />, path: "/usermangement" },
    { icon: <MdSettings className="w-4 h-4" />, path: "/settings" },
  ];

  return (
    <aside className="w-12 bg-white flex flex-col items-center py-5 space-y-6">
      <button className="w-8 h-8 flex items-center justify-center rounded-md">
        <FaArrowRight />
      </button>

      <nav className="flex flex-col space-y-4">
        {menu.map((item, i) => {
          const isActive =
            item.path === "/organizationchange"
              ? location.pathname.includes("/organizationchange")
              : item.path === "/usermangement"
              ? location.pathname.includes("/usermangement")
              : location.pathname === item.path;

          return (
            <button
              key={i}
              onClick={() => handleNavigation(item.path)}
              className={`w-8 h-8 flex items-center justify-center rounded-md ${
                isActive ? "bg-blue-500 text-white" : ""
              }`}
            >
              {item.icon}
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;