import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { User, Mail, Lock, Phone, ArrowRight, Loader } from "lucide-react"; // 👈 Phone Icon Added
import { toast } from "react-hot-toast";
import { BASE_URL } from "../config";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // 👈 Phone State Added
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

    // 🛡️ CHECK 1: Sabhi fields bhare hain ya nahi (Mandatory Check)
    if (!name || !email || !phone || !password || !confirmPassword) {
      toast.error("🚫 All fields are mandatory! Please fill everything.");
      return;
    }

    // 🛡️ CHECK 2: Passwords match?
    if (password !== confirmPassword) {
      toast.error("❌ Passwords do not match");
      return;
    }

    // 🛡️ CHECK 3: STRICT Phone Validation (Indian Numbers Only)
    // 10 digits hone chahiye aur start 6, 7, 8, ya 9 se hona chahiye.
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      toast.error("📞 Invalid Phone Number!");
      toast.error("Must be 10 digits and start with 6, 7, 8, or 9.");
      return;
    }

    // 🛡️ CHECK 4: Gmail Validation
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      toast.error("🚫 Only valid Gmail accounts are allowed!");
      return;
    }

    setIsLoading(true);

    try {
      // ✅ URL Update + Phone Number bhejna
      const res = await fetch(`${BASE_URL}/api/v1/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }), // 👈 Phone Sent to Backend
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Account created! Check your email. 📧");
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
          {/* NAME FIELD */}
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

          {/* EMAIL FIELD */}
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-gray-500" size={20} />
            <input
              type="email"
              placeholder="Gmail Address"
              className="w-full pl-12 p-3.5 rounded-xl bg-black/50 border border-gray-700 text-white focus:border-primary focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* 👇 NEW PHONE INPUT FIELD */}
          <div className="relative">
            <Phone
              className="absolute left-4 top-3.5 text-gray-500"
              size={20}
            />
            <input
              type="tel"
              placeholder="Phone Number (e.g. 9876543210)"
              className="w-full pl-12 p-3.5 rounded-xl bg-black/50 border border-gray-700 text-white focus:border-primary focus:outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              maxLength={10} // HTML level restriction
            />
          </div>

          {/* PASSWORD FIELD */}
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

          {/* CONFIRM PASSWORD FIELD */}
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
