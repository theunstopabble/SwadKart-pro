import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, Save, Loader } from "lucide-react";
import { BASE_URL } from "../config"; // 👈 IMPORT IMPORTANT

const ResetPassword = () => {
  const { token } = useParams(); // URL se token nikalne ke liye
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("❌ Passwords do not match");
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
        setSuccess(true);
        setTimeout(() => navigate("/login"), 3000); // 3 sec baad login par bhejo
      } else {
        setError(data.message || "❌ Invalid or Expired Token");
      }
    } catch (err) {
      setError("❌ Server Error");
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

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-center font-bold text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/20 text-green-400 p-3 rounded-lg mb-4 text-center font-bold text-sm">
            ✅ Password updated! Redirecting to Login...
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-4">
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
            className="w-full bg-primary hover:bg-red-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
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
