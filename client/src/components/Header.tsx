import { FaUser } from "react-icons/fa";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const gradientVariants = {
  violetBlue: "from-violet-500 to-blue-400",
  pinkOrange: "from-pink-500 to-orange-400",
  greenBlue: "from-emerald-500 to-cyan-400",
};

const Header = ({ variant = "violetBlue" }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        "/api/auth/signout",
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        alert(res.data.message);
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      alert("Logout failed");
    }
  };

  // ✅ close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`h-20 bg-gradient-to-r ${gradientVariants[variant]} flex items-center justify-end px-6 text-white shadow-md`}
    >
      <div className="relative" ref={dropdownRef}>
        
        {/* User Icon (CLICK) */}
        <div
          onClick={() => setShowDropdown(!showDropdown)}
          className="w-9 h-9 rounded-full border border-white flex items-center justify-center cursor-pointer"
        >
          <FaUser className="w-4 h-4" />
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-32 bg-white text-black rounded-lg shadow-lg py-2">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;