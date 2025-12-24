import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, Loader } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Backend Route match karein
      const response = await fetch(
        "http://localhost:8000/api/v1/users/password/forgot",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // ✅ Success: Sirf message dikhao, navigate mat karo
        setMessage("✅ Password reset link sent! Check your email.");
        setEmail("");
      } else {
        setError(data.message || "❌ User not found");
      }
    } catch (error) {
      setError("❌ Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-800">
        <h2 className="text-3xl font-bold text-center mb-6 text-primary">
          Forgot Password? 🔒
        </h2>
        <p className="text-gray-400 text-center mb-6">
          Enter your registered email address. We will send you a
          <span className="text-white font-bold"> Reset Link</span>.
        </p>

        {/* Messages */}
        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-center text-sm font-bold">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-500/20 text-green-400 p-3 rounded-lg mb-4 text-center text-sm font-bold">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-400 mb-2 ml-1 text-sm font-bold">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-4 top-3.5 text-gray-500"
                size={20}
              />
              <input
                type="email"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader className="animate-spin" />
            ) : (
              <>
                Send Link <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-gray-400 hover:text-white text-sm font-bold"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
