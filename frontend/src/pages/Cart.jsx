import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Trash2, ArrowLeft, ShoppingBag } from "lucide-react";
import { removeFromCart } from "../redux/cartSlice";

const Cart = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);

  // Total Bill Calculate karna
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price, 0);

  // Item Remove karna
  const handleRemove = (id) => {
    dispatch(removeFromCart(id));
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag size={80} className="text-gray-600 mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">
          Your Cart is Empty! 😕
        </h2>
        <p className="text-gray-400 mb-6">
          Lagta hai bhook nahi lagi? Kuch tasty order karo!
        </p>
        <Link
          to="/"
          className="bg-primary px-6 py-3 rounded-full text-white font-bold hover:bg-red-600 transition-colors"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <ShoppingBag className="text-primary" /> Your Food Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item._id}
              className="bg-gray-900 p-4 rounded-xl flex items-center justify-between border border-gray-800 shadow-md"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <h3 className="text-xl font-bold text-white">{item.name}</h3>
                  <p className="text-gray-400 text-sm">{item.category}</p>
                  <p className="text-primary font-bold mt-1">₹{item.price}</p>
                </div>
              </div>

              <button
                onClick={() => handleRemove(item._id)}
                className="bg-red-500/10 p-2 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}

          <Link
            to="/"
            className="inline-flex items-center text-gray-400 hover:text-white mt-4"
          >
            <ArrowLeft size={18} className="mr-2" /> Continue Shopping
          </Link>
        </div>

        {/* Right Side: Bill Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 sticky top-24">
            <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">
              Order Summary
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-400">
                <span>Items ({cartItems.length})</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Delivery Fee</span>
                <span className="text-green-400">Free</span>
              </div>
              <div className="border-t border-gray-700 pt-3 flex justify-between text-white text-lg font-bold">
                <span>Total Amount</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>

            <button
              onClick={() =>
                alert(
                  "Order Placed Successfully! 🚀 (Payment Integration Coming Soon)"
                )
              }
              className="w-full bg-primary hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
