import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Package, MapPin, Clock, ArrowRight } from "lucide-react";
import { BASE_URL } from "../config"; // 👈 IMPORT IMPORTANT

const MyOrders = () => {
  const { userInfo } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userInfo) {
      navigate("/login");
    } else {
      const fetchOrders = async () => {
        try {
          // 👇 FIX: Use BASE_URL instead of localhost
          const res = await fetch(`${BASE_URL}/api/v1/orders/myorders`, {
            headers: { Authorization: `Bearer ${userInfo.token}` },
          });
          const data = await res.json();
          setOrders(data);
          setLoading(false);
        } catch (error) {
          console.error(error);
          setLoading(false);
        }
      };
      fetchOrders();
    }
  }, [userInfo, navigate]);

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 pb-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-3">
          <Package className="text-primary" /> My Order History
        </h1>

        {loading ? (
          <p className="text-gray-400">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-lg">No orders found.</p>
            <Link to="/" className="text-primary hover:underline mt-2 block">
              Go order some delicious food! 🍔
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-gray-900 p-6 rounded-2xl border border-gray-800 hover:border-primary/50 transition-all group"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                      Order{" "}
                      <span className="text-primary">
                        #{order._id.substring(0, 8)}
                      </span>
                    </h3>
                    <p className="text-gray-400 text-sm flex items-center gap-1 mt-1">
                      <Clock size={14} />{" "}
                      {new Date(order.createdAt).toLocaleDateString()} at{" "}
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.isPaid
                          ? "bg-green-900/30 text-green-400"
                          : "bg-red-900/30 text-red-400"
                      }`}
                    >
                      {order.isPaid ? "PAID" : "UNPAID"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.isDelivered
                          ? "bg-green-900/30 text-green-400"
                          : "bg-yellow-900/30 text-yellow-400"
                      }`}
                    >
                      {order.isDelivered ? "DELIVERED" : "PROCESSING"}
                    </span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="bg-black/40 p-4 rounded-xl mb-4">
                  {order.orderItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm text-gray-300 mb-1 last:mb-0"
                    >
                      <span>
                        {item.qty} x {item.name}
                      </span>
                      <span className="font-bold">
                        ₹{item.price * item.qty}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-gray-700 mt-3 pt-2 flex justify-between font-bold text-white">
                    <span>Total Amount</span>
                    <span className="text-primary">₹{order.totalPrice}</span>
                  </div>
                </div>

                <Link
                  to={`/order/${order._id}`}
                  className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  View Details <ArrowRight size={18} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
