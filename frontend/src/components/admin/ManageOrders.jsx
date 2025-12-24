import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Check, X, Truck, Clock, MapPin } from "lucide-react";

const ManageOrders = () => {
  const { userInfo } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch All Orders
  const fetchOrders = async () => {
    try {
      // Backend route: GET /api/v1/orders/admin/all
      const res = await fetch("http://localhost:8000/api/v1/orders/admin/all", {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      const data = await res.json();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Mark as Delivered Handler
  const handleDeliver = async (id) => {
    if (window.confirm("Mark this order as Delivered?")) {
      try {
        const res = await fetch(
          `http://localhost:8000/api/v1/orders/${id}/deliver`,
          {
            method: "PUT",
            headers: { Authorization: `Bearer ${userInfo.token}` },
          }
        );
        if (res.ok) {
          fetchOrders(); // Refresh List
        }
      } catch (error) {
        alert("Error updating order");
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Truck className="text-primary" /> Manage Orders
      </h2>

      {loading ? (
        <p className="text-gray-400 text-center py-10">Loading Orders...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
          <p className="text-gray-400 text-lg">No orders placed yet.</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-white">
              <thead className="bg-gray-800 text-gray-400 uppercase text-xs tracking-wider font-bold">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-800/50 transition-all"
                  >
                    <td className="p-4 font-mono text-xs text-primary">
                      #{order._id.substring(0, 8)}
                    </td>
                    <td className="p-4 font-bold">
                      {order.user?.name || "Guest"}
                      <div className="text-xs text-gray-500 font-normal mt-1">
                        {order.user?.email}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-bold text-green-400">
                      ₹{order.totalPrice}
                    </td>

                    {/* Payment Status */}
                    <td className="p-4">
                      {order.isPaid ? (
                        <span className="flex items-center gap-1 text-green-400 text-xs font-bold bg-green-900/30 px-2 py-1 rounded">
                          <Check size={12} /> PAID
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400 text-xs font-bold bg-red-900/30 px-2 py-1 rounded">
                          <X size={12} /> PENDING
                        </span>
                      )}
                    </td>

                    {/* Delivery Status */}
                    <td className="p-4">
                      {order.isDelivered ? (
                        <span className="text-green-400 font-bold text-sm">
                          Delivered
                        </span>
                      ) : (
                        <span className="text-yellow-400 font-bold text-sm flex items-center gap-1">
                          <Clock size={14} /> Processing
                        </span>
                      )}
                    </td>

                    {/* Action Button */}
                    <td className="p-4">
                      {!order.isDelivered && (
                        <button
                          onClick={() => handleDeliver(order._id)}
                          className="bg-primary hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-bold shadow-lg transition-transform hover:scale-105"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
