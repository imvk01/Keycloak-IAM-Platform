import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE}/api/auth/signup`,
        {
          name,
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      if (res.data.success) {
        alert("Signup successful");
        navigate("/");
      } else {
        alert(res.data.message || "Signup failed");
      }
    } catch (err: unknown) {
      console.error("Signup error:", err);
      const errorMessage =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Server error. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-100 via-white to-gray-200">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-gray-200">
        <div className="text-center mb-6">
          <p className="text-md mb-2">Create account</p>
          <h1 className="text-3xl font-normal text-gray-800">Sign up</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              className="w-full mt-1 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
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
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>

        <p className="text-sm text-left mt-4 text-gray-600 font-semibold">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;