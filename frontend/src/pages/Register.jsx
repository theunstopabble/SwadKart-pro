import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { User, Mail, Lock, ArrowRight, Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import { BASE_URL } from "../config";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.user);

  useEffect(() => {
    if (userInfo) navigate("/");
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();

    // 🛡️ SECURITY CHECK 1: Passwords match?
    if (password !== confirmPassword) {
      toast.error("❌ Passwords do not match");
      return;
    }

    // 🛡️ SECURITY CHECK 2: Strict Gmail Validation
    // Sirf wahi email allow hoga jo '@gmail.com' par khatam ho
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (!gmailRegex.test(email)) {
      toast.error("🚫 Only valid Gmail accounts are allowed!");
      toast.error("Example: yourname@gmail.com");
      return; // Yahi rok do, server pe mat bhejo
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/v1/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Account created! Please Login.");
        navigate("/login");
      } else {
        toast.error(data.message || "Registration Failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Server unreachable?");
    } finally {
      setIsLoading(false);
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
              placeholder="Gmail Address (e.g. name@gmail.com)" // User ko hint de diya
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
