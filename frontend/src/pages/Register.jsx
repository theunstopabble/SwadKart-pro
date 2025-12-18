import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, ArrowRight } from "lucide-react";
import axios from "axios";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Backend ko data bhejo
      const { data } = await axios.post(
        "http://localhost:8000/api/users/register",
        {
          name,
          email,
          password,
        }
      );

      // Success hone par data save karo aur home pe bhejo
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/");
      alert("Account Created Successfully! Welcome to SwadKart 🍔");
    } catch (err) {
      setError(err.response?.data?.message || "Registration Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=1981&auto=format&fit=crop')] bg-cover bg-center relative">
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70"></div>

      {/* Register Card */}
      <div className="relative z-10 bg-black/60 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700">
        <h2 className="text-3xl font-bold text-white text-center mb-2">
          Join SwadKart
        </h2>
        <p className="text-gray-400 text-center mb-8">
          Create an account to order yummy food 🍕
        </p>

        {error && (
          <div className="bg-red-500/20 text-red-200 p-3 rounded mb-4 text-sm text-center border border-red-500/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:border-primary text-white placeholder-gray-400 transition-colors"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:border-primary text-white placeholder-gray-400 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              placeholder="Password (Min 6 chars)"
              className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg focus:outline-none focus:border-primary text-white placeholder-gray-400 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-red-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all transform active:scale-95"
          >
            {loading ? "Creating Account..." : "Sign Up"}{" "}
            <ArrowRight size={20} />
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary hover:underline font-semibold"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
