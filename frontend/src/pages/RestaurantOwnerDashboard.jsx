import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  CookingPot,
  Clock,
  PlusCircle,
  ChefHat,
  ClipboardList,
  TrendingUp,
  X,
} from "lucide-react";
import { BASE_URL } from "../config"; // 👈 IMPORT IMPORTANT (Path adjust karein)

const RestaurantOwnerDashboard = () => {
  const { userInfo } = useSelector((state) => state.user);

  // States
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ revenue: 0, pending: 0, delivered: 0 });

  // 👇 Modal State
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    image: "",
  });

  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // 👇 FIX: Use BASE_URL
        const response = await fetch(`${BASE_URL}/api/v1/orders`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        const data = await response.json();

        if (response.ok) {
          setOrders(data);
          const totalRevenue = data.reduce(
            (acc, order) => acc + (order.isPaid ? order.totalPrice : 0),
            0
          );
          const pendingCount = data.filter((o) => !o.isDelivered).length;
          const deliveredCount = data.filter((o) => o.isDelivered).length;

          setStats({
            revenue: totalRevenue,
            pending: pendingCount,
            delivered: deliveredCount,
          });
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    if (userInfo) fetchOrders();
  }, [userInfo]);

  // 👇 Handle Create Item
  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      // 👇 FIX: Use BASE_URL
      const res = await fetch(`${BASE_URL}/api/v1/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify(newItem),
      });

      if (res.ok) {
        alert("Item Added Successfully! 🍔");
        setShowModal(false);
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
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-white relative">
      <div className="max-w-7xl mx-auto">
        {/* Header & Add Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold flex items-center gap-3 tracking-tight">
              <ChefHat className="text-primary h-10 w-10" />
              Restaurant Dashboard
            </h1>
            <p className="text-gray-400 mt-2 text-lg">
              Overview of your live kitchen operations.
            </p>
          </div>

          {/* 👇 ADD ITEM BUTTON */}
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 shadow-lg shadow-primary/30 transition-all active:scale-95"
          >
            <PlusCircle size={20} /> Add Menu Item
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Stats Cards */}
          <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl border border-gray-800/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 font-medium mb-1 uppercase text-xs">
                  Pending Orders
                </p>
                <h3 className="text-4xl font-extrabold text-white">
                  {stats.pending}
                </h3>
              </div>
              <div className="bg-yellow-500/20 p-3 rounded-xl text-yellow-400">
                <Clock size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl border border-gray-800/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 font-medium mb-1 uppercase text-xs">
                  Revenue
                </p>
                <h3 className="text-4xl font-extrabold text-white">
                  ₹{stats.revenue}
                </h3>
              </div>
              <div className="bg-green-500/20 p-3 rounded-xl text-green-400">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-2xl border border-gray-800/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 font-medium mb-1 uppercase text-xs">
                  Completed
                </p>
                <h3 className="text-4xl font-extrabold text-white">
                  {stats.delivered}
                </h3>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-xl text-blue-400">
                <ClipboardList size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Live Orders List */}
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
          <CookingPot className="text-primary" /> Recent Orders
        </h2>

        {loading ? (
          <p className="text-center text-gray-500 animate-pulse">
            Loading orders...
          </p>
        ) : orders.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            No active orders right now.
          </p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-gray-900/80 backdrop-blur p-5 rounded-xl border border-gray-800 flex flex-col md:flex-row justify-between items-center gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-primary">
                      #{order._id.substring(0, 6)}
                    </h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${
                        !order.isDelivered
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {!order.isDelivered ? "Processing" : "Completed"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    User: {order.user?.name} • ₹{order.totalPrice}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 👇 ADD ITEM MODAL POPUP */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative animate-fade-in-up">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-6 text-white">
              Add New Menu Item
            </h2>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                  placeholder="e.g. Mahararaja Mac Burger"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-gray-400 text-sm mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                    placeholder="299"
                    value={newItem.price}
                    onChange={(e) =>
                      setNewItem({ ...newItem, price: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-400 text-sm mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                    placeholder="Burger, Pizza..."
                    value={newItem.category}
                    onChange={(e) =>
                      setNewItem({ ...newItem, category: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                  placeholder="https://image-url.com/burger.jpg"
                  value={newItem.image}
                  onChange={(e) =>
                    setNewItem({ ...newItem, image: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">
                  Description
                </label>
                <textarea
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none h-24"
                  placeholder="Describe the tasty food..."
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all"
              >
                Create Item
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantOwnerDashboard;
