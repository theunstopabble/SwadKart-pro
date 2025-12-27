import { useEffect, useState } from "react"; // 👈 useState import kiya
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../redux/cartSlice";
import CheckoutSteps from "../components/CheckoutSteps";
import { MapPin, Wallet, ShoppingBag, ArrowRight, Loader2 } from "lucide-react"; // Loader icon
import { BASE_URL } from "../config";
import { Capacitor } from "@capacitor/core";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.user);

  // 🕒 Loading State for Animation Delay
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Calculations ---
  const itemsPrice = cart.cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );
  const shippingPrice = itemsPrice > 500 ? 0 : 40;
  const taxPrice = Number((0.05 * itemsPrice).toFixed(2));
  const totalPrice = (
    Number(itemsPrice) +
    Number(shippingPrice) +
    Number(taxPrice)
  ).toFixed(2);

  // --- Redirects ---
  useEffect(() => {
    if (!cart.shippingAddress.address) navigate("/shipping");
    else if (!cart.paymentMethod) navigate("/payment");
  }, [cart, navigate]);

  // --- VERIFY PAYMENT WITH DELAY ---
  const verifyPayment = async (response, dbOrderId) => {
    try {
      // 1. Backend Verification Call
      const verifyRes = await fetch(`${BASE_URL}/api/v1/payment/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({
          razorpay_payment_id: response.razorpay_payment_id,
          orderId: dbOrderId,
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        // ✅ SUCCESS!
        // 🕒 Ab yahan hum 2-3 second ka WAIT karenge taaki animation feel aaye
        setTimeout(() => {
          dispatch(clearCart());
          navigate(`/order/${dbOrderId}`);
          setIsProcessing(false); // Loading band
        }, 2500); // 👈 2.5 Seconds ka Delay
      } else {
        setIsProcessing(false);
        alert(`Payment Verification Failed: ${verifyData.message}`);
      }
    } catch (error) {
      setIsProcessing(false);
      alert("Verification Error: " + error.message);
    }
  };

  const getRazorpayInstance = () => {
    // Helper for Web SDK
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // --- MAIN HANDLER ---
  const placeOrderHandler = async () => {
    try {
      setIsProcessing(true); // 🟢 Start Processing Animation

      // 1. Create Order in Database
      const formattedOrderItems = cart.cartItems.map((item) => ({
        name: item.name,
        qty: item.qty,
        image: item.image,
        price: item.price,
        product: item._id,
        restaurant: item.restaurant,
      }));

      const orderData = {
        orderItems: formattedOrderItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      };

      const res = await fetch(`${BASE_URL}/api/v1/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Order Creation Failed");

      // Handle COD
      if (cart.paymentMethod === "COD") {
        setTimeout(() => {
          dispatch(clearCart());
          navigate(`/order/${data._id}`);
          setIsProcessing(false);
        }, 2000); // COD me bhi thoda delay accha lagta hai
        return;
      }

      // Handle ONLINE
      if (cart.paymentMethod === "Online") {
        const orderRes = await fetch(
          `${BASE_URL}/api/v1/payment/create-order`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userInfo.token}`,
            },
            body: JSON.stringify({ amount: totalPrice }),
          }
        );
        const { order: razorpayOrder } = await orderRes.json();
        const keyRes = await fetch(`${BASE_URL}/api/v1/payment/key`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        const { key } = await keyRes.json();

        const options = {
          key: key,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "SwadKart",
          description: "Food Order",
          order_id: razorpayOrder.id,
          prefill: {
            name: userInfo.name,
            email: userInfo.email,
            contact: userInfo.phone || "9999999999",
          },
          theme: { color: "#e11d48" },
        };

        if (Capacitor.isNativePlatform()) {
          // --- ANDROID ---
          // @ts-ignore
          window.RazorpayCheckout.open(
            options,
            (successData) => {
              // Note: Native plugin closes immediately.
              // Humara 'isProcessing' state true hai, to UI me loading dikhta rahega.
              let responseObj = successData;
              if (typeof successData === "string") {
                try {
                  responseObj = JSON.parse(successData);
                } catch (e) {
                  responseObj = { razorpay_payment_id: successData };
                }
              }
              const response = {
                razorpay_payment_id: responseObj.razorpay_payment_id,
              };
              verifyPayment(response, data._id);
            },
            (error) => {
              setIsProcessing(false);
              alert(`Payment Failed: ${JSON.stringify(error)}`);
            }
          );
        } else {
          // --- WEB ---
          await getRazorpayInstance();
          const rzp = new window.Razorpay({
            ...options,
            handler: function (response) {
              verifyPayment(response, data._id);
            },
          });
          rzp.open();
          setIsProcessing(false); // Web SDK khulne par loader hata do (kyunki unka apna UI hai)
        }
      }
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      alert(error.message);
    }
  };

  // 🎨 FULL SCREEN LOADING OVERLAY
  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
        <h2 className="text-2xl font-bold animate-pulse">
          Processing Payment...
        </h2>
        <p className="text-gray-400 mt-2">Please do not close the app</p>
        {/* Optional: Yahan aap apni custom coin animation GIF bhi laga sakte ho */}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 pb-10">
      <CheckoutSteps step1 step2 step3 step4 />
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 mt-8">
        <div className="lg:w-2/3 space-y-6">
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
              <MapPin /> Shipping Details
            </h2>
            <p className="text-gray-300">
              {cart.shippingAddress.address}, {cart.shippingAddress.city},{" "}
              {cart.shippingAddress.postalCode}
            </p>
          </div>
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
              <Wallet /> Payment Method
            </h2>
            <p className="text-gray-300">Method: {cart.paymentMethod}</p>
          </div>
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
              <ShoppingBag /> Order Items
            </h2>
            <div className="space-y-4">
              {cart.cartItems.map((item, index) => (
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
                    <span className="font-bold">{item.name}</span>
                  </div>
                  <div className="text-gray-400">
                    {item.qty} x ₹{item.price}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:w-1/3">
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 sticky top-24">
            <h2 className="text-2xl font-bold mb-6 border-b border-gray-800 pb-4">
              Order Summary
            </h2>
            <div className="space-y-3 text-gray-300 mb-6">
              <div className="flex justify-between">
                <span>Items</span>
                <span>₹{itemsPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingPrice === 0 ? "Free" : `₹${shippingPrice}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%)</span>
                <span>₹{taxPrice}</span>
              </div>
            </div>
            <div className="flex justify-between text-xl font-bold text-white border-t border-gray-800 pt-4 mb-6">
              <span>Total</span>
              <span className="text-primary">₹{totalPrice}</span>
            </div>
            <button
              onClick={placeOrderHandler}
              disabled={isProcessing}
              className="w-full bg-primary hover:bg-red-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Place Order <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
