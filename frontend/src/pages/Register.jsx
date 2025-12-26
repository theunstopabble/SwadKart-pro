import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Loader,
  KeyRound,
} from "lucide-react"; // 👈 KeyRound Icon Added
import { toast } from "react-hot-toast";
import { BASE_URL } from "../config";
// 👇 IMPORT: Ye path check kar lena, jahan aapka authSlice hai
import { setCredentials } from "../redux/features/auth/authSlice";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 👇 NEW STATES FOR OTP
  const [otpSent, setOtpSent] = useState(false); // Form dikhana hai ya OTP screen?
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);

  useEffect(() => {
    if (userInfo) navigate("/");
  }, [navigate, userInfo]);

  // ==========================================
  // 1️⃣ STEP 1: SEND OTP (Register API)
  // ==========================================
  const submitHandler = async (e) => {
    e.preventDefault();

    // VALIDATIONS
    if (!name || !email || !phone || !password || !confirmPassword) {
      toast.error("🚫 All fields are mandatory!");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("❌ Passwords do not match");
      return;
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      toast.error("📞 Invalid Phone Number! (10 digits, starts 6-9)");
      return;
    }
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      toast.error("🚫 Only official Gmail accounts are allowed!");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/v1/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setOtpSent(true); // ✅ Screen Switch: Ab OTP mangenge
        toast.success(data.message || "OTP sent to your email! 📧");
      } else {
        toast.error(data.message || "Registration Failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server Error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 2️⃣ STEP 2: VERIFY OTP (Verify API)
  // ==========================================
  const verifyOtpHandler = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("❌ Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/v1/users/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("🎉 Account Verified! Welcome to SwadKart.");
        // 🔥 Auto Login: Redux mein store kar do
        dispatch(setCredentials(data));
        navigate("/");
      } else {
        toast.error(data.message || "Invalid or Expired OTP");
      }
    } catch (err) {
      toast.error("Verification failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800">
        <h2 className="text-3xl font-extrabold text-white text-center mb-2">
          {otpSent ? "Verify Email 🔐" : "Join SwadKart 🍔"}
        </h2>
        <p className="text-gray-400 text-center mb-6">
          {otpSent
            ? `Enter the OTP sent to ${email}`
            : "Create an account to start ordering"}
        </p>

        {/* 👇 CONDITIONAL RENDERING: Form dikhana hai ya OTP Input? */}
        {!otpSent ? (
          // === FORM VIEW ===
          <form onSubmit={submitHandler} className="space-y-4">
            <div className="relative">
              <User
                className="absolute left-4 top-3.5 text-gray-500"
                size={20}
              />
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
              <Mail
                className="absolute left-4 top-3.5 text-gray-500"
                size={20}
              />
              <input
                type="email"
                placeholder="Gmail Address"
                className="w-full pl-12 p-3.5 rounded-xl bg-black/50 border border-gray-700 text-white focus:border-primary focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Phone
                className="absolute left-4 top-3.5 text-gray-500"
                size={20}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full pl-12 p-3.5 rounded-xl bg-black/50 border border-gray-700 text-white focus:border-primary focus:outline-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                maxLength={10}
              />
            </div>

            <div className="relative">
              <Lock
                className="absolute left-4 top-3.5 text-gray-500"
                size={20}
              />
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
              <Lock
                className="absolute left-4 top-3.5 text-gray-500"
                size={20}
              />
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
                  Send OTP <ArrowRight size={20} />
                </>
              )}
            </button>

            <p className="text-gray-400 text-center mt-6 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-bold hover:underline"
              >
                Login here
              </Link>
            </p>
          </form>
        ) : (
          // === OTP INPUT VIEW ===
          <form onSubmit={verifyOtpHandler} className="space-y-6">
            <div className="relative">
              <KeyRound
                className="absolute left-4 top-3.5 text-gray-500"
                size={20}
              />
              <input
                type="text"
                placeholder="Enter 6-Digit OTP"
                className="w-full pl-12 p-3.5 rounded-xl bg-black/50 border border-gray-700 text-white text-center text-xl tracking-widest focus:border-primary focus:outline-none"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20"
            >
              {isLoading ? (
                <Loader className="animate-spin" />
              ) : (
                <>
                  Verify & Login <ArrowRight size={20} />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="w-full text-gray-400 hover:text-white text-sm transition-colors"
            >
              Wrong Email? Go Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
