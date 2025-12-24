import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { User, Mail, Lock, Save, Camera, FileText } from "lucide-react";
import { BASE_URL } from "../config"; // 👈 IMPORT IMPORTANT

const Profile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState(null);

  const { userInfo } = useSelector((state) => state.user);

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name);
      setEmail(userInfo.email);
      setDescription(userInfo.description || "");
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      // 👇 FIX: Use BASE_URL instead of localhost
      const res = await fetch(`${BASE_URL}/api/v1/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({ name, email, password, description }),
      });
      const data = await res.json();

      if (res.ok) {
        alert("Profile Updated Successfully! 🎉");
        // Optional: Refresh page to see changes or dispatch Redux action
        // window.location.reload();
      } else {
        alert(data.message || "Update Failed");
      }
    } catch (error) {
      console.error(error);
      alert("Server Error. Check console.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <User className="text-primary" size={32} />
          <h1 className="text-3xl font-bold">User Profile</h1>
        </div>

        {message && (
          <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-6 border border-red-500/50">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-6 border-b border-gray-800 pb-4">
              Edit Details
            </h2>
            <form onSubmit={submitHandler} className="space-y-6">
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-3 top-3 text-gray-500"
                    size={18}
                  />
                  <input
                    type="text"
                    className="w-full bg-black border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-3 text-gray-500"
                    size={18}
                  />
                  <input
                    type="email"
                    className="w-full bg-black border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Description Box */}
              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">
                  About / Description
                </label>
                <div className="relative">
                  <FileText
                    className="absolute left-3 top-3 text-gray-500"
                    size={18}
                  />
                  <textarea
                    className="w-full bg-black border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3 h-32 resize-none focus:border-primary focus:outline-none"
                    placeholder="Description about your shop..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">
                  New Password (Optional)
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-3 text-gray-500"
                    size={18}
                  />
                  <input
                    type="password"
                    className="w-full bg-black border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-bold mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-3 text-gray-500"
                    size={18}
                  />
                  <input
                    type="password"
                    className="w-full bg-black border border-gray-700 text-white rounded-lg pl-10 pr-4 py-3"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-primary hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-all"
              >
                <Save size={20} /> Update Profile
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/20 to-transparent"></div>
              <div className="relative w-24 h-24 bg-black rounded-full border-4 border-gray-800 flex items-center justify-center text-3xl font-bold text-primary mb-4 shadow-xl">
                {userInfo?.image ? (
                  <img
                    src={userInfo.image}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  name?.charAt(0) || "U"
                )}
              </div>
              <h2 className="text-2xl font-bold">{name}</h2>
              <p className="text-gray-400 text-sm mb-4">{email}</p>
              <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20">
                {userInfo?.role === "restaurant_owner"
                  ? "Restaurant Owner"
                  : "Verified User"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
