import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { io } from "socket.io-client"; // 👈 1. Socket Import
import {
  MapPin,
  User,
  CheckCircle,
  XCircle,
  Clock,
  ShoppingBag,
  Utensils,
  Truck,
} from "lucide-react";
import { BASE_URL } from "../config";

// 🔌 2. Socket Connection (Component के बाहर ताकि बार-बार न बने)
const socket = io(BASE_URL, {
  withCredentials: true,
});

const OrderDetails = () => {
  const { id } = useParams();
  const { userInfo } = useSelector((state) => state.user);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status List for Visual Tracking
  const statusSteps = [
    "Placed",
    "Cooking",
    "Ready",
    "Out for Delivery",
    "Delivered",
  ];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/v1/orders/${id}`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });

        if (!res.ok) throw new Error("Order not found");

        const data = await res.json();
        setOrder(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (userInfo) {
      fetchOrder();

      // ⚡ 3. Socket Logic: Join Order Room
      socket.emit("joinOrder", id);

      // 📡 4. Listen for Live Updates
      socket.on("orderUpdated", (updatedOrder) => {
        console.log("🚀 Live Status Update:", updatedOrder.orderStatus);
        setOrder(updatedOrder); // State update = UI update
      });
    }

    // Cleanup when leaving page
    return () => {
      socket.off("orderUpdated");
    };
  }, [id, userInfo]);

  if (loading)
    return (
      <div className="text-white text-center pt-24 animate-pulse">
        Loading Order Details...
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center pt-24">{error}</div>;

  const currentStatusIndex = statusSteps.indexOf(order?.orderStatus);

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 pb-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-200">
          Order{" "}
          <span className="text-primary">#{order._id.substring(0, 8)}</span>
        </h1>

        {/* 🛵 LIVE TRACKING STEPPER (NEW SECTION) */}
        <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 mb-8 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              return (
                <div
                  key={step}
                  className="flex flex-col items-center z-10 flex-1"
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      isCompleted
                        ? "bg-primary shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                        : "bg-gray-800"
                    } ${isCurrent ? "animate-bounce scale-110" : ""}`}
                  >
                    {index === 0 && <ShoppingBag size={20} />}
                    {index === 1 && <Utensils size={20} />}
                    {index === 2 && <CheckCircle size={20} />}
                    {index === 3 && <Truck size={20} />}
                    {index === 4 && <MapPin size={20} />}
                  </div>
                  <p
                    className={`mt-3 font-bold text-sm ${
                      isCompleted ? "text-white" : "text-gray-600"
                    }`}
                  >
                    {step}
                  </p>
                  {isCurrent && (
                    <span className="text-[10px] text-primary animate-pulse">
                      Processing...
                    </span>
                  )}
                </div>
              );
            })}
            {/* Background Line */}
            <div className="hidden md:block absolute top-6 left-0 right-0 h-1 bg-gray-800 -z-0 rounded-full mx-10"></div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT SIDE: Details */}
          <div className="lg:w-2/3 space-y-6">
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                <User size={20} /> Customer & Delivery
              </h2>
              <div className="space-y-2 text-gray-300">
                <p>
                  <strong className="text-white">Name:</strong>{" "}
                  {order.user.name}
                </p>
                <p>
                  <strong className="text-white">Email:</strong>{" "}
                  {order.user.email}
                </p>
                <div className="flex gap-2 mt-2">
                  <MapPin className="text-primary" size={20} />
                  <p>
                    {order.shippingAddress.address},{" "}
                    {order.shippingAddress.city}
                  </p>
                </div>
              </div>

              {/* Delivery Status Alert */}
              <div
                className={`mt-4 p-3 rounded-lg flex items-center gap-2 font-bold ${
                  order.isDelivered
                    ? "bg-green-900/30 text-green-400"
                    : "bg-yellow-900/30 text-yellow-400"
                }`}
              >
                {order.isDelivered ? (
                  <>
                    <CheckCircle size={20} /> Delivered on{" "}
                    {new Date(order.deliveredAt).toLocaleDateString()}
                  </>
                ) : (
                  <>
                    <Clock size={20} /> Current Status:{" "}
                    <span className="uppercase">{order.orderStatus}</span>
                  </>
                )}
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <h2 className="text-xl font-bold mb-4 text-primary">Payment</h2>
              <p className="text-gray-300 mb-2">
                <strong>Method:</strong> {order.paymentMethod}
              </p>
              <div
                className={`p-3 rounded-lg flex items-center gap-2 font-bold ${
                  order.isPaid
                    ? "bg-green-900/30 text-green-400"
                    : "bg-red-900/30 text-red-400"
                }`}
              >
                {order.isPaid ? (
                  <>
                    <CheckCircle size={20} /> Paid on{" "}
                    {new Date(order.paidAt).toLocaleDateString()}
                  </>
                ) : (
                  <>
                    <XCircle size={20} /> Payment Pending
                  </>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                <ShoppingBag size={20} /> Items
              </h2>
              <div className="space-y-4">
                {order.orderItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-gray-800 pb-2"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <span className="text-white font-bold">{item.name}</span>
                    </div>
                    <div className="text-gray-400">
                      {item.qty} x ₹{item.price} ={" "}
                      <span className="text-white font-bold">
                        ₹{item.qty * item.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Summary */}
          <div className="lg:w-1/3">
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 sticky top-24">
              <h2 className="text-2xl font-bold mb-6 border-b border-gray-800 pb-4">
                Order Summary
              </h2>
              <div className="space-y-3 text-gray-300 mb-6 font-medium">
                <div className="flex justify-between">
                  <span>Items</span>
                  <span>₹{order.itemsPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹{order.shippingPrice}</span>
                </div>
                <div className="flex justify-between border-t border-gray-800 pt-3 text-xl font-bold text-white">
                  <span>Total</span>
                  <span className="text-primary">₹{order.totalPrice}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
