import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "/api/auth/signin",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      // 🔥 FULL DEBUG
      console.log("🔥 FULL LOGIN RESPONSE:", res.data);

      if (res.data.success) {
        // ✅ extract teamId safely from multiple possible structures
        const teamId =
          res.data.teamId ||
          res.data.user?.teamId ||
          res.data.data?.teamId ||
          res.data.user?._id || // fallback (if backend uses _id)
          null;

        console.log("✅ Extracted teamId:", teamId);

        if (teamId) {
          localStorage.setItem("teamId", teamId);
          console.log("💾 teamId saved in localStorage:", teamId);
        } else {
          console.error("❌ teamId NOT FOUND in response");
          alert("teamId not found in backend response");
        }

        alert(res.data.message || "Login successful");

        navigate("/dashboard");
      } else {
        alert(res.data.message || "Invalid credentials");
      }
    } catch (err: unknown) {
      console.error("❌ Login error:", err);
    
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || err.message);
      } else {
        alert("Server error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    alert("Google login not implemented yet");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-100 via-white to-gray-200">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-gray-200">

        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-md mb-2">Welcome</p>
          <h1 className="text-3xl font-normal text-gray-800">Log in</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-sm font-medium">Username or email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin"
              className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

        </form>

        {/* Signup */}
        <p className="text-sm text-left mt-4 text-gray-600 font-semibold">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Sign up here
          </span>
        </p>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 h-0.5 bg-blue-600"></div>
          <span className="px-3 text-sm text-gray-700 font-semibold">
            OR
          </span>
          <div className="flex-1 h-0.5 bg-blue-600"></div>
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-lg hover:bg-gray-100 transition"
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            className="w-5 h-5"
            alt="Google"
          />
          Continue with Google
        </button>

      </div>
    </div>
  );
};

export default Login;