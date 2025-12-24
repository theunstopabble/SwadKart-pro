import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Trash2, Plus, Utensils, Image as ImageIcon } from "lucide-react";

const ManageMenu = () => {
  const { userInfo } = useSelector((state) => state.user);

  // Data States
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    image: "",
    category: "",
    description: "",
    isVeg: true,
  });

  // 1. Fetch All Restaurants (Dropdown ke liye)
  useEffect(() => {
    const fetchShops = async () => {
      const res = await fetch("http://localhost:8000/api/v1/restaurants");
      const data = await res.json();
      setShops(data);
      // Agar shops hain, to pehli shop default select karlo
      if (data.length > 0) setSelectedShop(data[0]._id);
    };
    fetchShops();
  }, []);

  // 2. Fetch Menu jab Shop Change ho
  useEffect(() => {
    if (!selectedShop) return;
    const fetchMenu = async () => {
      setLoading(true);
      try {
        // Backend route jo humne fix kiya tha
        const res = await fetch(
          `http://localhost:8000/api/v1/restaurants/menu/${selectedShop}`
        );
        const data = await res.json();
        setMenuItems(data);
      } catch (error) {
        console.error("Error fetching menu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [selectedShop]);

  // 3. Handle Add Item
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/v1/admin/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({ ...formData, restaurantId: selectedShop }),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          name: "",
          price: "",
          image: "",
          category: "",
          description: "",
          isVeg: true,
        });
        // Refresh List
        const updatedMenuRes = await fetch(
          `http://localhost:8000/api/v1/restaurants/menu/${selectedShop}`
        );
        const updatedMenu = await updatedMenuRes.json();
        setMenuItems(updatedMenu);
        alert("Item Added Successfully! 🍔");
      } else {
        alert("Failed to add item. Check Backend.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 4. Handle Delete Item
  const handleDelete = async (id) => {
    if (window.confirm("Delete this food item?")) {
      await fetch(`http://localhost:8000/api/v1/admin/product/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      // Filter out deleted item from UI
      setMenuItems(menuItems.filter((item) => item._id !== id));
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Utensils className="text-primary" /> Manage Menu
        </h2>

        {/* SHOP SELECTOR DROPDOWN */}
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">Select Restaurant:</span>
          <select
            className="bg-gray-800 text-white p-2 rounded-lg border border-gray-700 outline-none focus:border-primary"
            value={selectedShop}
            onChange={(e) => setSelectedShop(e.target.value)}
          >
            {shops.map((shop) => (
              <option key={shop._id} value={shop._id}>
                {shop.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowModal(true)}
          disabled={!selectedShop}
          className="bg-primary hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold shadow-lg shadow-primary/20"
        >
          <Plus size={18} /> Add Food Item
        </button>
      </div>

      {/* MENU LIST */}
      {loading ? (
        <p className="text-gray-400 text-center py-10">Loading Menu...</p>
      ) : menuItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-lg">
            No food items in this restaurant yet.
          </p>
          <p className="text-sm text-gray-600">
            Select a restaurant and click "Add Food Item".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div
              key={item._id}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex gap-4 p-3 hover:border-primary/40 transition-all"
            >
              <div className="h-24 w-24 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white">{item.name}</h3>
                  <p className="text-primary font-bold text-sm">
                    ₹{item.price}
                  </p>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                    {item.description}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded ${
                      item.isVeg
                        ? "bg-green-900 text-green-400"
                        : "bg-red-900 text-red-400"
                    }`}
                  >
                    {item.isVeg ? "VEG" : "NON-VEG"}
                  </span>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-red-500 hover:text-red-400 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL FOR ADDING ITEM */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md border border-gray-700 relative">
            <h3 className="text-2xl font-bold mb-6 text-white">
              Add Food Item
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Item Name (e.g. Cheese Burger)"
                className="w-full bg-black/50 border border-gray-700 p-3 rounded-lg text-white"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />

              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="Price (₹)"
                  className="w-1/2 bg-black/50 border border-gray-700 p-3 rounded-lg text-white"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Category (e.g. Fast Food)"
                  className="w-1/2 bg-black/50 border border-gray-700 p-3 rounded-lg text-white"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                />
              </div>

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

              <textarea
                placeholder="Description"
                className="w-full bg-black/50 border border-gray-700 p-3 rounded-lg text-white h-24"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              ></textarea>

              <div className="flex items-center gap-3">
                <span className="text-gray-400">Type:</span>
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="radio"
                    name="isVeg"
                    checked={formData.isVeg === true}
                    onChange={() => setFormData({ ...formData, isVeg: true })}
                  />{" "}
                  Veg
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input
                    type="radio"
                    name="isVeg"
                    checked={formData.isVeg === false}
                    onChange={() => setFormData({ ...formData, isVeg: false })}
                  />{" "}
                  Non-Veg
                </label>
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
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMenu;
