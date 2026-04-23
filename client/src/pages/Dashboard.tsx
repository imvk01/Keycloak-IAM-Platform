import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdBusiness, MdSettings } from "react-icons/md";
import { FaUserEdit, FaUserPlus } from "react-icons/fa";
import Header from "../components/Header";

const cards = [
  { title: "Benutzer einladen", type: "invite", path: "/inviteuser" },
  { title: "Organisation ändern", type: "org", path: "/organizationchange" },
  { title: "Benutzer verwalten", type: "manage", path: "/usermangement" },
  { title: "Globale Einstellungen", type: "settings", path: "/settings" },
];

const GradientDefs = () => (
  <svg width="0" height="0">
    <defs>
      <linearGradient id="iconGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#60a5fa" />
      </linearGradient>
    </defs>
  </svg>
);

const CardIcon = ({ type }: { type: string }) => {
  const iconStyle = {
    width: "56px",
    height: "56px",
    fill: "url(#iconGradient)",
  };

  return (
    <div className="mt-2 flex justify-center">
      <GradientDefs />

      {type === "invite" && <FaUserPlus style={iconStyle} />}
      {type === "org" && <MdBusiness style={iconStyle} />}
      {type === "manage" && <FaUserEdit style={iconStyle} />}
      {type === "settings" && <MdSettings style={iconStyle} />}
    </div>
  );
};

const Dashboard = () => {
  const [search, setSearch] = useState("");
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

  return (
    <div className="min-h-screen bg-slate-100">
      <Header />

      <div className="flex flex-col items-center px-6 py-10">
        <h1 className="text-3xl font-serif text-slate-800 mb-3">
          Benutzer suchen
        </h1>

        <div className="flex items-center gap-4 w-full max-w-3xl">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-blue-500">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="6" />
                <line x1="16" y1="16" x2="21" y2="21" />
              </svg>
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-11 pr-4 py-3.5 bg-white rounded-md text-sm text-slate-800 outline-none shadow-md"
            />
          </div>

          <button className="px-6 py-3.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition">
            Benutzer suchen
          </button>
        </div>

        <div
          className="mt-20 grid gap-6
                     grid-cols-1
                     sm:grid-cols-2
                     md:grid-cols-3
                     lg:grid-cols-4"
        >
          {cards.map((card) => (
            <div
              key={card.title}
              onClick={() => handleNavigation(card.path)}
              className="bg-white w-64 h-28 rounded-md flex flex-col items-center justify-center shadow-md hover:shadow-xl hover:scale-105 cursor-pointer transition"
            >
              <h2 className="text-base font-semibold text-slate-900 text-center">
                {card.title}
              </h2>

              <CardIcon type={card.type} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;