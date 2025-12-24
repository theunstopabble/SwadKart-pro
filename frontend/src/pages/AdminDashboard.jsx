import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  ShoppingBag,
  Store,
  UtensilsCrossed,
  Plus,
  PlusCircle,
  TrendingUp,
  X,
  Edit2,
  MapPin,
  CheckCircle,
  Clock,
  Truck,
} from "lucide-react";
import { BASE_URL } from "../config"; // 👈 IMPORT IMPORTANT (Path adjust karein)

const AdminDashboard = () => {
  const { userInfo } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("overview");

  // Modals
  const [showItemModal, setShowItemModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [showDummyModal, setShowDummyModal] = useState(false);

  // Data
  const [stats, setStats] = useState({ revenue: 0, orders: 0, users: 0 });
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);

  // Forms
  const [selectedRestaurant, setSelectedRestaurant] = useState("");
  const [editingShop, setEditingShop] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    image: "",
  });
  const [newShop, setNewShop] = useState({
    name: "",
    email: "",
    password: "",
    image: "",
  });
  const [dummyShopData, setDummyShopData] = useState({ name: "", image: "" });

  // ================= FETCH DATA =================
  const fetchAllData = async () => {
    const headers = { Authorization: `Bearer ${userInfo.token}` };
    try {
      // 👇 FIX: Use BASE_URL
      const resRest = await fetch(`${BASE_URL}/api/v1/users/restaurants`, {
        headers,
      });
      if (resRest.ok) {
        const dataRest = await resRest.json();
        setRestaurants(dataRest);
        setStats((prev) => ({ ...prev, users: dataRest.length }));
      }
    } catch (err) {
      console.error(err);
    }

    try {
      // 👇 FIX: Use BASE_URL
      const resOrders = await fetch(`${BASE_URL}/api/v1/orders/admin/all`, {
        headers,
      });
      if (resOrders.ok) {
        const dataOrders = await resOrders.json();
        setOrders(dataOrders);
        const totalRev = dataOrders.reduce(
          (acc, order) => acc + (order.isPaid ? order.totalPrice : 0),
          0
        );
        setStats((prev) => ({
          ...prev,
          revenue: totalRev,
          orders: dataOrders.length,
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (userInfo) fetchAllData();
  }, [userInfo, activeTab]);

  // ================= ACTIONS =================

  // Create Manual Dummy Shop (FIXED REFRESH)
  const handleCreateDummyShop = async (e) => {
    e.preventDefault();
    try {
      // 👇 FIX: Use BASE_URL
      const res = await fetch(`${BASE_URL}/api/v1/users/admin/create-dummy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify(dummyShopData),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message + " 🏪");
        setShowDummyModal(false);
        setDummyShopData({ name: "", image: "" });
        await fetchAllData(); // Force Refresh List
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Add Full Shop
  const handleAddShop = async (e) => {
    e.preventDefault();
    try {
      // 👇 FIX: Use BASE_URL
      const res = await fetch(`${BASE_URL}/api/v1/users/admin/create-shop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify(newShop),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Shop Created!");
        setShowAddShopModal(false);
        setNewShop({ name: "", email: "", password: "", image: "" });
        fetchAllData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Menu Item
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!selectedRestaurant) return alert("Select a restaurant");
    try {
      // 👇 FIX: Use BASE_URL
      const res = await fetch(`${BASE_URL}/api/v1/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({ ...newItem, restaurantId: selectedRestaurant }),
      });
      if (res.ok) {
        alert("Item Added!");
        setShowItemModal(false);
        setNewItem({
          name: "",
          price: "",
          description: "",
          category: "",
          image: "",
        });
      } else {
        alert("Error adding item");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Shop
  const handleUpdateShop = async (e) => {
    e.preventDefault();
    try {
      // 👇 FIX: Use BASE_URL
      const res = await fetch(`${BASE_URL}/api/v1/users/${editingShop._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({
          name: editingShop.name,
          image: editingShop.image,
        }),
      });
      if (res.ok) {
        alert("Updated!");
        setShowShopModal(false);
        fetchAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // UI Helpers
  const openEditModal = (shop) => {
    setEditingShop(shop);
    setShowShopModal(true);
  };
  const getStatusBadge = (order) => {
    if (order.isDelivered)
      return (
        <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
          <CheckCircle size={12} /> DELIVERED
        </span>
      );
    if (order.deliveryPartner)
      return (
        <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
          <Truck size={12} /> ON WAY
        </span>
      );
    return (
      <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit">
        <Clock size={12} /> PENDING
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold flex items-center gap-3">
            <span className="text-4xl">👑</span> Admin Control Center
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-10 border-b border-gray-800 pb-4">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "orders", label: "Manage Orders", icon: ShoppingBag },
            { id: "shops", label: "Manage Shops", icon: Store },
            { id: "menu", label: "Manage Menu", icon: UtensilsCrossed },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-lg"
                  : "bg-gray-900 text-gray-400 hover:bg-gray-800"
              }`}
            >
              <tab.icon size={18} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "overview" && (
          <div className="animate-fade-in-up space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/20 rounded-lg text-green-500">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase">
                      Revenue
                    </p>
                    <h3 className="text-2xl font-bold">
                      ₹{stats.revenue.toLocaleString()}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/20 rounded-lg text-orange-500">
                    <Store size={24} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase">
                      Restaurants
                    </p>
                    <h3 className="text-2xl font-bold">{stats.users}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-gray-800">
              <h3 className="font-bold text-xl">Order History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-400">
                <thead className="bg-black text-gray-200 uppercase font-bold text-sm">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {orders.map((o) => (
                    <tr key={o._id} className="hover:bg-gray-800/50">
                      <td className="p-4 text-primary font-mono text-xs">
                        #{o._id.substring(0, 6)}
                      </td>
                      <td className="p-4 text-white font-bold">
                        {o.user?.name}
                      </td>
                      <td className="p-4 text-green-400 font-bold">
                        ₹{o.totalPrice}
                      </td>
                      <td className="p-4">{getStatusBadge(o)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "shops" && (
          <div className="animate-fade-in-up">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Store className="text-primary" /> Restaurants
              </h2>
              <div className="flex gap-3">
                {/* Dummy Button */}
                <button
                  onClick={() => setShowDummyModal(true)}
                  className="bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 shadow-lg"
                >
                  <PlusCircle size={20} /> Add Dummy Shop
                </button>
                {/* Full Register Button */}
                <button
                  onClick={() => setShowAddShopModal(true)}
                  className="bg-primary hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 shadow-lg"
                >
                  <Plus size={20} /> Full Register
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((shop) => (
                <div
                  key={shop._id}
                  className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden group relative"
                >
                  <div className="h-48 relative">
                    <img
                      src={
                        shop.image ||
                        "https://images.unsplash.com/photo-1552566626-52f8b828add9"
                      }
                      alt={shop.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(shop)}
                        className="bg-white text-black font-bold py-2 px-6 rounded-full flex items-center gap-2"
                      >
                        <Edit2 size={16} /> Edit
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {shop.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {shop.email.includes("@dummy") ? (
                        <span className="text-yellow-500 text-xs border border-yellow-500/30 px-2 rounded">
                          DUMMY
                        </span>
                      ) : (
                        shop.email
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "menu" && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 animate-fade-in-up">
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
              <UtensilsCrossed className="text-primary" /> Update Menu
            </h2>
            <select
              value={selectedRestaurant}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              className="w-full md:w-1/2 bg-black border border-gray-700 rounded-xl p-4 text-white focus:outline-none mb-6"
            >
              <option value="">-- Select Restaurant --</option>
              {restaurants.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </select>
            {selectedRestaurant && (
              <div className="text-center p-10 border-2 border-dashed border-gray-700 rounded-2xl bg-black/20">
                <p className="text-gray-400 mb-4">
                  Adding items for:{" "}
                  <strong className="text-white">
                    {
                      restaurants.find((r) => r._id === selectedRestaurant)
                        ?.name
                    }
                  </strong>
                </p>
                <button
                  onClick={() => setShowItemModal(true)}
                  className="bg-primary hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 shadow-lg mx-auto"
                >
                  <Plus size={20} /> Add Menu Item
                </button>
              </div>
            )}
          </div>
        )}

        {/* MODALS */}

        {/* Dummy Shop Modal */}
        {showDummyModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 w-full max-w-lg rounded-2xl p-8 shadow-2xl relative">
              <button
                onClick={() => setShowDummyModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-4">Add Dummy Shop</h2>
              <form onSubmit={handleCreateDummyShop} className="space-y-4">
                <input
                  type="text"
                  placeholder="Shop Name"
                  className="w-full bg-gray-800 border-gray-700 p-3 rounded text-white"
                  value={dummyShopData.name}
                  onChange={(e) =>
                    setDummyShopData({ ...dummyShopData, name: e.target.value })
                  }
                  required
                />
                <input
                  type="text"
                  placeholder="Image URL"
                  className="w-full bg-gray-800 border-gray-700 p-3 rounded text-white"
                  value={dummyShopData.image}
                  onChange={(e) =>
                    setDummyShopData({
                      ...dummyShopData,
                      image: e.target.value,
                    })
                  }
                />
                <button
                  type="submit"
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-xl"
                >
                  Create
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Add Item Modal */}
        {showItemModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 w-full max-w-lg rounded-2xl p-8 shadow-2xl relative">
              <button
                onClick={() => setShowItemModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-4">Add Menu Item</h2>
              <form onSubmit={handleAddItem} className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full bg-gray-800 border-gray-700 p-3 rounded text-white"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  required
                />
                <div className="flex gap-4">
                  <input
                    type="number"
                    placeholder="Price"
                    className="w-full bg-gray-800 border-gray-700 p-3 rounded text-white"
                    value={newItem.price}
                    onChange={(e) =>
                      setNewItem({ ...newItem, price: e.target.value })
                    }
                    required
                  />
                  <input
                    type="text"
                    placeholder="Category"
                    className="w-full bg-gray-800 border-gray-700 p-3 rounded text-white"
                    value={newItem.category}
                    onChange={(e) =>
                      setNewItem({ ...newItem, category: e.target.value })
                    }
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="Image URL"
                  className="w-full bg-gray-800 border-gray-700 p-3 rounded text-white"
                  value={newItem.image}
                  onChange={(e) =>
                    setNewItem({ ...newItem, image: e.target.value })
                  }
                />
                <textarea
                  placeholder="Description"
                  className="w-full bg-gray-800 border-gray-700 p-3 rounded text-white h-24"
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  required
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-primary font-bold py-3 rounded-xl"
                >
                  Add Item
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Full Shop Modal */}
        {showAddShopModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 w-full max-w-lg rounded-2xl p-8 shadow-2xl relative">
              <button
                onClick={() => setShowAddShopModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-4">Register New Shop</h2>
              <form onSubmit={handleAddShop} className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full bg-gray-800 border-gray-700 p-3 rounded text-white"
                  value={newShop.name}
                  onChange={(e) =>
                    setNewShop({ ...newShop, name: e.target.value })
                  }
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full bg-gray-800 border-gray-700 p-3 rounded text-white"
                  value={newShop.email}
                  onChange={(e) =>
                    setNewShop({ ...newShop, email: e.target.value })
                  }
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  autoComplete="new-password"
                  className="w-full bg-gray-800 border-gray-700 p-3 rounded text-white"
                  value={newShop.password}
                  onChange={(e) =>
                    setNewShop({ ...newShop, password: e.target.value })
                  }
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl"
                >
                  Register
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Edit Shop Modal */}
        {showShopModal && editingShop && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 w-full max-w-lg rounded-2xl p-8 shadow-2xl relative">
              <button
                onClick={() => setShowShopModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-4">Edit Shop</h2>
              <form onSubmit={handleUpdateShop} className="space-y-4">
                <input
                  type="text"
                  className="w-full bg-gray-800 border-gray-700 p-3 rounded text-white"
                  value={editingShop.name}
                  onChange={(e) =>
                    setEditingShop({ ...editingShop, name: e.target.value })
                  }
                />
                <input
                  type="text"
                  className="w-full bg-gray-800 border-gray-700 p-3 rounded text-white"
                  value={editingShop.image}
                  onChange={(e) =>
                    setEditingShop({ ...editingShop, image: e.target.value })
                  }
                />
                <button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl"
                >
                  Save
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
