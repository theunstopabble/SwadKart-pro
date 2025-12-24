import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Trash2, Edit, Plus, MapPin, Star, Clock } from "lucide-react";
import { BASE_URL } from "../../config"; // 👈 IMPORT IMPORTANT

const ManageShops = () => {
  const { userInfo } = useSelector((state) => state.user);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    location: "",
    rating: "4.5",
    deliveryTime: "30",
  });

  // Fetch Shops
  const fetchShops = async () => {
    try {
      // 👇 FIX: Use BASE_URL and Correct Route (/users/restaurants)
      const res = await fetch(`${BASE_URL}/api/v1/users/restaurants`);
      const data = await res.json();
      setShops(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching shops", error);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  // Handle Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this restaurant?")) {
      // 👇 FIX: Use BASE_URL
      // Note: Backend mein DELETE route hona chahiye (e.g., router.delete('/:id'))
      // Filhal hum `/users/${id}` try karenge, agar backend me route nahi hai to add karna padega
      await fetch(`${BASE_URL}/api/v1/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      fetchShops(); // Refresh list
    }
  };

  // Handle Add
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 👇 FIX: Use BASE_URL and Correct Route from userRoutes.js
      // Backend Route: router.post("/admin/create-shop", ...)
      const res = await fetch(`${BASE_URL}/api/v1/users/admin/create-shop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          name: "",
          image: "",
          location: "",
          rating: "4.5",
          deliveryTime: "30",
        });
        fetchShops();
        alert("Restaurant Added Successfully! 🏪");
      } else {
        alert("Failed to add shop. Check backend logs.");
      }
    } catch (error) {
      console.error(error);
      alert("Error adding shop");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Manage Restaurants</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-primary/20"
        >
          <Plus size={18} /> Add New Restaurant
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading shops...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <div
              key={shop._id}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group hover:border-primary/50 transition-all"
            >
              <div className="h-40 overflow-hidden relative">
                <img
                  src={shop.image}
                  alt={shop.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => handleDelete(shop._id)}
                    className="bg-red-600 p-2 rounded-lg text-white hover:bg-red-700 shadow-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-white">{shop.name}</h3>
                <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                  <MapPin size={14} /> {shop.location || "Jaipur"}
                </p>
                <div className="flex justify-between items-center mt-4 text-sm font-bold text-gray-500">
                  <span className="flex items-center gap-1 text-yellow-500">
                    <Star size={14} /> {shop.rating || "4.5"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {shop.deliveryTime || "30"} min
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL FOR ADDING SHOP */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md border border-gray-700">
            <h3 className="text-2xl font-bold mb-6 text-white">
              Add New Restaurant
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Restaurant Name"
                className="w-full bg-black/50 border border-gray-700 p-3 rounded-lg text-white"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Image URL"
                className="w-full bg-black/50 border border-gray-700 p-3 rounded-lg text-white"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Location"
                className="w-full bg-black/50 border border-gray-700 p-3 rounded-lg text-white"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
              />
              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="Rating (e.g 4.5)"
                  className="w-1/2 bg-black/50 border border-gray-700 p-3 rounded-lg text-white"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: e.target.value })
                  }
                  required
                />
                <input
                  type="number"
                  placeholder="Time (min)"
                  className="w-1/2 bg-black/50 border border-gray-700 p-3 rounded-lg text-white"
                  value={formData.deliveryTime}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryTime: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-primary hover:bg-red-600 text-white py-3 rounded-lg font-bold"
                >
                  Save Shop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageShops;
