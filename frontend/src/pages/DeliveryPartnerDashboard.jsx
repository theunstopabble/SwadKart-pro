import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
  Truck,
  MapPin,
  CheckCircle2,
  Package,
  Navigation2,
} from "lucide-react";
import { BASE_URL } from "../../config"; // 👈 IMPORT IMPORTANT (Path adjust karein)

const DeliveryPartnerDashboard = () => {
  const { userInfo } = useSelector((state) => state.user);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Assignments
  const fetchMyDeliveries = async () => {
    try {
      // 👇 FIX: Use BASE_URL
      // Ensure backend has route: router.get('/my-deliveries', protect, getMyDeliveries)
      const response = await fetch(`${BASE_URL}/api/v1/orders/my-deliveries`, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      const data = await response.json();
      if (response.ok) setTasks(data);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo) fetchMyDeliveries();
  }, [userInfo]);

  // 2. Mark as Delivered Function
  const markAsDelivered = async (id) => {
    if (!window.confirm("Are you sure this order is delivered?")) return;

    try {
      // 👇 FIX: Use BASE_URL
      // Route: router.put('/:id/deliver', protect, updateOrderToDelivered)
      const response = await fetch(`${BASE_URL}/api/v1/orders/${id}/deliver`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });

      if (response.ok) {
        alert("Order Delivered Successfully! 🚀");
        fetchMyDeliveries(); // Refresh list
      } else {
        alert("Error updating status");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold flex items-center gap-3 tracking-tight">
            <Truck className="text-blue-500 h-10 w-10" />
            Delivery Dashboard
          </h1>
        </div>

        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-900/40 to-gray-900/40 backdrop-blur-xl p-8 rounded-3xl border border-blue-500/20 shadow-xl mb-10">
          <h2 className="text-2xl font-bold mb-2">
            Welcome, {userInfo?.name}! 👋
          </h2>
          <div className="inline-flex items-center gap-3 bg-black/30 px-5 py-2 rounded-full border border-green-500/30">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="font-bold text-green-400 text-sm">Online</span>
          </div>
        </div>

        <h3 className="text-xl font-bold mb-6 flex items-center gap-2 pl-2 border-l-4 border-blue-500">
          Assigned Deliveries ({tasks.filter((t) => !t.isDelivered).length})
        </h3>

        {loading ? (
          <div className="text-center py-10">Loading your tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-gray-500">No deliveries assigned yet.</div>
        ) : (
          <div className="space-y-6">
            {tasks.map((task) => (
              <div
                key={task._id}
                className={`rounded-2xl overflow-hidden border transition-all ${
                  !task.isDelivered
                    ? "bg-gray-900/80 border-blue-500/50 shadow-blue-500/10"
                    : "bg-gray-900/40 border-green-500/20 opacity-70"
                }`}
              >
                <div className="px-6 py-3 bg-gray-800/50 flex justify-between items-center">
                  <span className="font-bold">
                    Order #{task._id.substring(0, 6)}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                      task.isDelivered
                        ? "bg-green-500/20 text-green-400"
                        : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {task.isDelivered ? "Delivered" : "On the way"}
                  </span>
                </div>

                <div className="p-6 md:flex justify-between items-center gap-6">
                  <div className="flex-1 space-y-4">
                    {/* Delivery Address (From User Object) */}
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase mb-1">
                        Deliver To
                      </p>
                      <h4 className="text-lg font-bold text-white">
                        {task.user?.name || "Guest"}
                      </h4>
                      <div className="flex items-start gap-2 text-gray-300 mt-1">
                        <MapPin
                          size={18}
                          className="text-blue-500 shrink-0 mt-0.5"
                        />
                        <p>
                          {task.shippingAddress?.address},{" "}
                          {task.shippingAddress?.city}
                        </p>
                      </div>
                    </div>
                  </div>

                  {!task.isDelivered && (
                    <button
                      onClick={() => markAsDelivered(task._id)}
                      className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-lg"
                    >
                      <CheckCircle2 size={20} /> Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryPartnerDashboard;
