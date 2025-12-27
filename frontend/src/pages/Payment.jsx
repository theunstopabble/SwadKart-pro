import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { savePaymentMethod } from "../redux/cartSlice";
import CheckoutSteps from "../components/CheckoutSteps";
import { CreditCard, Banknote, ArrowRight } from "lucide-react";
// 👇 IMPORT CAPACITOR
import { Capacitor } from "@capacitor/core";

const Payment = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress, userInfo } = cart;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [paymentMethod, setPaymentMethod] = useState("Online");

  useEffect(() => {
    if (!shippingAddress.address) {
      navigate("/shipping");
    }
  }, [shippingAddress, navigate]);

  // 🚀 PAYMENT HANDLER (UPDATED)
  const submitHandler = async (e) => {
    e.preventDefault();

    // 1️⃣ Agar COD hai, to seedha aage badho
    if (paymentMethod === "COD") {
      dispatch(savePaymentMethod("COD"));
      navigate("/placeorder");
      return;
    }

    // 2️⃣ Agar Mobile App (Android/iOS) hai + Online Payment
    if (Capacitor.isNativePlatform() && paymentMethod === "Online") {
      const options = {
        description: "SwadKart Order",
        image: "https://swadkart-pro.vercel.app/logo.png",
        currency: "INR",
        key: "rzp_test_RtEFhSFhqt7iBi", // Test Key
        amount: "50000", // ₹500 Test Amount
        name: "SwadKart",
        prefill: {
          email: userInfo?.email || "user@swadkart.com",
          contact: userInfo?.mobile || "9876543210",
          name: userInfo?.name || "User",
        },
        theme: { color: "#D10024" },
      };

      try {
        // @ts-ignore
        window.RazorpayCheckout.open(
          options,
          (paymentId) => {
            // ✅ Success: Alert dikhao aur aage badho
            // alert(`Payment ID: ${paymentId}`); // Optional alert hata sakte ho
            dispatch(savePaymentMethod("Online"));
            navigate("/placeorder");
          },
          (error) => {
            // ❌ Failure
            alert(`Payment Failed: ${error.description}`);
          }
        );
      } catch (err) {
        alert("Plugin Error: " + err.message);
      }

      // ⚠️ IMPORTANT: Yahan 'return' lagana zaroori hai taaki niche wala code na chale
      return;
    }

    // 3️⃣ Agar Website (PWA) hai + Online Payment
    // To normal flow (Place Order page par hi payment hoga)
    dispatch(savePaymentMethod("Online"));
    navigate("/placeorder");
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 pb-10">
      <CheckoutSteps step1 step2 step3 />

      <div className="max-w-lg mx-auto bg-gray-900/50 backdrop-blur-md p-8 rounded-2xl border border-gray-800 shadow-2xl mt-8">
        <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-3">
          Payment Method
        </h1>

        <form onSubmit={submitHandler} className="space-y-6">
          {/* ONLINE OPTION */}
          <label
            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
              paymentMethod === "Online"
                ? "bg-primary/20 border-primary"
                : "bg-gray-800 border-gray-700"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="Online"
              checked={paymentMethod === "Online"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-5 h-5 accent-primary"
            />
            <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
              <CreditCard size={24} />
            </div>
            <div>
              <span className="block font-bold text-white">Online Payment</span>
              <span className="text-xs text-gray-400">UPI, Cards, Wallets</span>
            </div>
          </label>

          {/* COD OPTION */}
          <label
            className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
              paymentMethod === "COD"
                ? "bg-primary/20 border-primary"
                : "bg-gray-800 border-gray-700"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="COD"
              checked={paymentMethod === "COD"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-5 h-5 accent-primary"
            />
            <div className="bg-green-500/20 p-2 rounded-lg text-green-400">
              <Banknote size={24} />
            </div>
            <div>
              <span className="block font-bold text-white">
                Cash on Delivery
              </span>
              <span className="text-xs text-gray-400">
                Pay when food arrives
              </span>
            </div>
          </label>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg mt-6 flex justify-center items-center gap-2"
          >
            Continue <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Payment;
