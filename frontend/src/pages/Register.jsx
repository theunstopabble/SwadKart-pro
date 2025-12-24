import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCredentials } from "../redux/userSlice";
import { User, Mail, Lock, ArrowRight, Loader } from "lucide-react";
import { BASE_URL } from "../config"; // 👈 IMPORT IMPORTANT

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.user);

  useEffect(() => {
    if (userInfo) navigate("/");
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
    } else {
      setIsLoading(true);
      setMessage(null);
      try {
        // 👇 FIX: Use BASE_URL instead of localhost
        const res = await fetch(`${BASE_URL}/api/v1/users/register`, {
          // Note: Backend route usually is /register or just /users (POST). Based on your previous code it was /register
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          // Register successful
          dispatch(setCredentials(data));
          navigate("/");
        } else {
          setMessage(data.message || "Registration Failed");
        }
      } catch (err) {
        console.error(err); // Debugging ke liye
        setMessage("Something went wrong. Server unreachable?");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800">
        <h2 className="text-3xl font-extrabold text-white text-center mb-2">
          Join SwadKart 🍔
        </h2>
        <p className="text-gray-400 text-center mb-6">
          Create an account to start ordering
        </p>

        {message && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-center font-bold text-sm">
            {message}
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-3.5 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Full Name"
              className="w-full pl-12 p-3.5 rounded-xl bg-black/50 border border-gray-700 text-white focus:border-primary focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-gray-500" size={20} />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full pl-12 p-3.5 rounded-xl bg-black/50 border border-gray-700 text-white focus:border-primary focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-gray-500" size={20} />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-12 p-3.5 rounded-xl bg-black/50 border border-gray-700 text-white focus:border-primary focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-gray-500" size={20} />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full pl-12 p-3.5 rounded-xl bg-black/50 border border-gray-700 text-white focus:border-primary focus:outline-none"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-red-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            {isLoading ? (
              <Loader className="animate-spin" />
            ) : (
              <>
                Create Account <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <p className="text-gray-400 text-center mt-6 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
