import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";
import { LogIn, ShieldCheck } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", { email, password });
      if (response.data.success) {
        login(response.data.user, response.data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed! Check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3 text-indigo-500">
            <ShieldCheck size={48} />
          </div>
          <h2 className="text-3xl font-extrabold text-white">Enterprise CRM</h2>
          <p className="text-slate-400 text-sm mt-1">
            Sign in to access your leads dashboard
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="vaishnavi.admin@gmail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-lg shadow-indigo-600/30 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <LogIn size={20} />
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
