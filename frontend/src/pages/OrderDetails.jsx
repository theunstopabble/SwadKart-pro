import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  MapPin,
  Phone,
  User,
  CheckCircle,
  XCircle,
  Clock,
  ShoppingBag,
} from "lucide-react";

const OrderDetails = () => {
  const { id } = useParams();
  const { userInfo } = useSelector((state) => state.user);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/orders/${id}`, {
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
    }
  }, [id, userInfo]);

  if (loading)
    return (
      <div className="text-white text-center pt-24">
        Loading Order Details...
      </div>
    );
  if (error)
    return <div className="text-red-500 text-center pt-24">{error}</div>;

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 pb-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-200">
          Order{" "}
          <span className="text-primary">#{order._id.substring(0, 8)}</span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT SIDE */}
          <div className="lg:w-2/3 space-y-6">
            {/* 1. Delivery Details */}
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
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.postalCode},{" "}
                    {order.shippingAddress.country}
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
                    <Clock size={20} /> Delivery Pending
                  </>
                )}
              </div>
            </div>

            {/* 2. Payment Status */}
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <h2 className="text-xl font-bold mb-4 text-primary">
                Payment Method
              </h2>
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

            {/* 3. Order Items */}
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                <ShoppingBag size={20} /> Order Items
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
                      <Link
                        to={`/restaurant/${item.restaurant}`}
                        className="text-white hover:text-primary font-bold"
                      >
                        {item.name}
                      </Link>
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
              <div className="space-y-3 text-gray-300 mb-6">
                <div className="flex justify-between">
                  <span>Items</span>
                  <span>₹{order.itemsPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹{order.shippingPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>₹{order.taxPrice}</span>
                </div>
              </div>
              <div className="flex justify-between text-xl font-bold text-white border-t border-gray-800 pt-4">
                <span>Total</span>
                <span className="text-primary">₹{order.totalPrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
