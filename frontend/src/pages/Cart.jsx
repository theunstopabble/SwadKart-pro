import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "../redux/cartSlice";
import { Trash2, ShoppingCart, ArrowRight, Minus, Plus } from "lucide-react";

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;
  const { userInfo } = useSelector((state) => state.user);

  // Calculate Subtotal
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.qty * item.price,
    0
  );
  const tax = subtotal * 0.05; // 5% Tax
  const shipping = subtotal > 500 ? 0 : 40; // Free shipping over ₹500
  const total = subtotal + tax + shipping;

  const checkoutHandler = () => {
    if (!userInfo) {
      navigate("/login?redirect=shipping");
    } else {
      navigate("/shipping"); // Next Step: Address Page
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 px-4 pb-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-3">
          <ShoppingCart className="text-primary" size={32} /> Your Food Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-gray-900 rounded-2xl border border-gray-800">
            <div className="flex justify-center mb-4">
              <ShoppingCart size={64} className="text-gray-600" />
            </div>
            <p className="text-2xl text-gray-400 font-bold mb-2">
              Your cart is empty!
            </p>
            <p className="text-gray-500 mb-6">
              Looks like you haven't added any delicious food yet.
            </p>
            <Link
              to="/"
              className="bg-primary hover:bg-red-600 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-primary/30"
            >
              Explore Restaurants
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* CART ITEMS LIST */}
            <div className="lg:w-2/3 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-gray-900 p-4 rounded-xl flex items-center gap-4 border border-gray-800 hover:border-gray-700 transition-all"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />

                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-white">
                      {item.name}
                    </h3>
                    <p className="text-primary font-bold">₹{item.price}</p>
                    <p className="text-xs text-gray-500">{item.category}</p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 bg-black/50 px-3 py-1 rounded-lg border border-gray-700">
                    <button
                      onClick={() =>
                        dispatch(addToCart({ ...item, qty: item.qty - 1 }))
                      }
                      disabled={item.qty === 1}
                      className="text-gray-400 hover:text-white disabled:opacity-30"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-bold w-4 text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() =>
                        dispatch(addToCart({ ...item, qty: item.qty + 1 }))
                      }
                      className="text-gray-400 hover:text-white"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => dispatch(removeFromCart(item._id))}
                    className="bg-red-500/10 p-2 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            {/* ORDER SUMMARY (Checkout Box) */}
            <div className="lg:w-1/3">
              <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 sticky top-24">
                <h2 className="text-xl font-bold mb-6 border-b border-gray-800 pb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 text-gray-300 mb-6">
                  <div className="flex justify-between">
                    <span>
                      Subtotal (
                      {cartItems.reduce((acc, item) => acc + item.qty, 0)}{" "}
                      items)
                    </span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (5%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className={shipping === 0 ? "text-green-400" : ""}>
                      {shipping === 0 ? "FREE" : `₹${shipping}`}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-xl font-bold text-white border-t border-gray-800 pt-4 mb-6">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
                </div>

                <button
                  onClick={checkoutHandler}
                  className="w-full bg-primary hover:bg-red-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/25 transform hover:-translate-y-1"
                >
                  Proceed to Checkout <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
