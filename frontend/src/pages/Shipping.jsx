import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { saveShippingAddress } from "../redux/cartSlice"; // Redux Action
import CheckoutSteps from "../components/CheckoutSteps"; // Progress Bar
import { MapPin, Truck } from "lucide-react";

const Shipping = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  // Agar pehle se saved hai to wahi dikhao
  const [address, setAddress] = useState(shippingAddress?.address || "");
  const [city, setCity] = useState(shippingAddress?.city || "");
  const [postalCode, setPostalCode] = useState(
    shippingAddress?.postalCode || ""
  );
  const [country, setCountry] = useState(shippingAddress?.country || "");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    // 1. Save to Redux & LocalStorage
    dispatch(saveShippingAddress({ address, city, postalCode, country }));
    // 2. Next Step -> Payment
    navigate("/payment");
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 pb-10">
      {/* Step 1 & 2 Active */}
      <CheckoutSteps step1 step2 />

      <div className="max-w-lg mx-auto bg-gray-900/50 backdrop-blur-md p-8 rounded-2xl border border-gray-800 shadow-2xl mt-8">
        <h1 className="text-3xl font-extrabold mb-6 flex items-center gap-3">
          <Truck className="text-primary" /> Shipping Details
        </h1>

        <form onSubmit={submitHandler} className="space-y-5">
          {/* Address */}
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">
              Address
            </label>
            <div className="relative">
              <MapPin
                className="absolute left-4 top-3.5 text-gray-500"
                size={18}
              />
              <input
                type="text"
                placeholder="Enter your street address"
                className="w-full pl-11 p-3.5 rounded-xl bg-white/5 border border-gray-700 text-white focus:border-primary focus:outline-none transition-all placeholder-gray-600"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">
              City
            </label>
            <input
              type="text"
              placeholder="Enter city"
              className="w-full p-3.5 rounded-xl bg-white/5 border border-gray-700 text-white focus:border-primary focus:outline-none transition-all placeholder-gray-600"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </div>

          {/* Postal Code & Country */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">
                Postal Code
              </label>
              <input
                type="text"
                placeholder="Zip Code"
                className="w-full p-3.5 rounded-xl bg-white/5 border border-gray-700 text-white focus:border-primary focus:outline-none transition-all placeholder-gray-600"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
              />
            </div>
            <div className="w-1/2">
              <label className="block text-gray-400 text-sm font-bold mb-2 ml-1">
                Country
              </label>
              <input
                type="text"
                placeholder="Country"
                className="w-full p-3.5 rounded-xl bg-white/5 border border-gray-700 text-white focus:border-primary focus:outline-none transition-all placeholder-gray-600"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transform hover:-translate-y-1 transition-all mt-4"
          >
            Continue to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default Shipping;
