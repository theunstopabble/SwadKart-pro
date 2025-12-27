import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../redux/cartSlice";
import CheckoutSteps from "../components/CheckoutSteps";
import { MapPin, Wallet, ShoppingBag, ArrowRight } from "lucide-react";
import { BASE_URL } from "../config";
// 👇 IMPORT CAPACITOR
import { Capacitor } from "@capacitor/core";

const PlaceOrder = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.user);

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
    if (!cart.shippingAddress.address) {
      navigate("/shipping");
    } else if (!cart.paymentMethod) {
      navigate("/payment");
    }
  }, [cart, navigate]);

  // --- UNIVERSAL VERIFICATION HANDLER ---
  const verifyPayment = async (response, dbOrderId) => {
    try {
      // DEBUG: Alert taaki humein pata chale backend ko kya bhej rahe hain
      // alert(`Verifying: \nPayment: ${response.razorpay_payment_id} \nOrder: ${response.razorpay_order_id}`);

      const verifyRes = await fetch(`${BASE_URL}/api/v1/payment/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
        body: JSON.stringify({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          orderId: dbOrderId,
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyData.success) {
        // ✅ Verification Successful
        dispatch(clearCart());
        navigate(`/order/${dbOrderId}`);
      } else {
        // ❌ Verification Failed
        alert(
          `Verification Failed! Backend says: ${JSON.stringify(verifyData)}`
        );
      }
    } catch (error) {
      alert("Verification Error: " + error.message);
    }
  };

  // --- Web SDK Loader ---
  const loadRazorpayScript = () => {
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
      // 1. Prepare Order Data
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

      // 2. Create Order in Database (Pending)
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

      // 3. Handle COD
      if (cart.paymentMethod === "COD") {
        dispatch(clearCart());
        navigate(`/order/${data._id}`);
        return;
      }

      // 4. Handle ONLINE Payment
      if (cart.paymentMethod === "Online") {
        // A. Fetch Key
        const keyRes = await fetch(`${BASE_URL}/api/v1/payment/key`, {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        const { key } = await keyRes.json();

        // B. Create Razorpay Server Order
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

        // 🚀 C. PLATFORM CHECK
        if (Capacitor.isNativePlatform()) {
          // --- ANDROID NATIVE FLOW ---
          try {
            // @ts-ignore
            window.RazorpayCheckout.open(
              options,
              (successData) => {
                // 🛠️ UNIVERSAL FIX: Data Formatting
                let responseObj = successData;

                // Agar string mein data aaya, to parse karo
                if (typeof successData === "string") {
                  try {
                    responseObj = JSON.parse(successData);
                  } catch (e) {
                    // Agar parse nahi hua, to shayed wo direct paymentId hai (Web style)
                    responseObj = { razorpay_payment_id: successData };
                  }
                }

                // Debugging Alert (Remove later if needed)
                // alert("Plugin Response: " + JSON.stringify(responseObj));

                const response = {
                  razorpay_payment_id: responseObj.razorpay_payment_id,
                  // Agar plugin se order_id na mile, to hamara create kiya hua use karo
                  razorpay_order_id:
                    responseObj.razorpay_order_id || razorpayOrder.id,
                  razorpay_signature: responseObj.razorpay_signature,
                };

                verifyPayment(response, data._id);
              },
              (error) => {
                // Error object ko string mein dikhao taaki padh sakein
                alert(`Payment Failed: ${JSON.stringify(error)}`);
              }
            );
          } catch (err) {
            alert("Native Plugin Error: " + err.message);
          }
        } else {
          // --- WEB FLOW ---
          const isScriptLoaded = await loadRazorpayScript();
          if (!isScriptLoaded) {
            alert("Razorpay SDK failed to load.");
            return;
          }

          const rzp = new window.Razorpay({
            ...options,
            handler: function (response) {
              verifyPayment(response, data._id);
            },
          });
          rzp.open();
        }
      }
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 pb-10">
      <CheckoutSteps step1 step2 step3 step4 />

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 mt-8">
        {/* Left Side: Details */}
        <div className="lg:w-2/3 space-y-6">
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
              <MapPin /> Shipping Details
            </h2>
            <p className="text-gray-300">
              {cart.shippingAddress.address}, {cart.shippingAddress.city},{" "}
              {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
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
            {cart.cartItems.length === 0 ? (
              <p>Your cart is empty</p>
            ) : (
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
                      <Link
                        to={`/restaurant/${item.restaurant}`}
                        className="hover:text-primary font-bold"
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
            )}
          </div>
        </div>

        {/* Right Side: Summary */}
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
              className="w-full bg-primary hover:bg-red-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
            >
              Place Order <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;
