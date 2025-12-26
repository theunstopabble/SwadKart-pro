import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, Save, Loader } from "lucide-react";
import { toast } from "react-hot-toast"; // ✅ Toast UI added
import { BASE_URL } from "../config";

const ResetPassword = () => {
  const { token } = useParams(); // URL se token nikalne ke liye
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password !== confirmPassword) {
      toast.error("❌ Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // 👇 FIX: Use BASE_URL instead of localhost
      const res = await fetch(
        `${BASE_URL}/api/v1/users/password/reset/${token}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, confirmPassword }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Password updated! Redirecting to Login...");
        setTimeout(() => navigate("/login"), 2000); // 2 sec baad login par bhejo
      } else {
        toast.error(data.message || "❌ Invalid or Expired Token");
      }
    } catch (err) {
      toast.error("❌ Server Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-2xl">
        <h2 className="text-3xl font-extrabold text-center mb-6">
          Reset Password 🔐
        </h2>

        <form onSubmit={submitHandler} className="space-y-6">
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-gray-500" size={20} />
            <input
              type="password"
              placeholder="New Password"
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
            disabled={loading}
            className="w-full bg-primary hover:bg-red-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
          >
            {loading ? (
              <Loader className="animate-spin" />
            ) : (
              <>
                Update Password <Save size={20} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
