import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/userSlice";
import { clearCart } from "../redux/cartSlice";
import {
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  Package,
  LayoutDashboard,
  Store, // 👇 New Icon for Restaurant
  Truck, // 👇 New Icon for Delivery
} from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.user);

  const logoutHandler = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate("/login");
    setShowDropdown(false);
  };

  return (
    <nav className="bg-black/80 backdrop-blur-md border-b border-gray-800 fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* 1. LOGO */}
          <Link
            to="/"
            className="text-3xl font-extrabold text-white tracking-wide"
          >
            Swad<span className="text-primary">Kart</span>
          </Link>

          {/* 2. DESKTOP LINKS */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-gray-300 hover:text-primary font-bold transition-all"
            >
              Home
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative text-gray-300 hover:text-white transition-all"
            >
              <ShoppingCart size={26} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                </span>
              )}
            </Link>

            {/* User Check */}
            {userInfo ? (
              <div className="relative">
                {/* User Name Button */}
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 text-white font-bold bg-gray-900 px-4 py-2 rounded-full border border-gray-700 hover:border-primary transition-all"
                >
                  <User size={18} className="text-primary" />
                  {userInfo.name.split(" ")[0]}
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl py-2 animate-fade-in-up">
                    {/* --- ADMIN ROLE --- */}
                    {userInfo.role === "admin" && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-yellow-400 hover:bg-gray-800"
                        onClick={() => setShowDropdown(false)}
                      >
                        <LayoutDashboard size={16} /> Admin Dashboard
                      </Link>
                    )}

                    {/* --- RESTAURANT OWNER ROLE --- */}
                    {userInfo.role === "restaurant_owner" && (
                      <Link
                        to="/restaurant-dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-orange-400 hover:bg-gray-800"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Store size={16} /> Restaurant Panel
                      </Link>
                    )}

                    {/* --- DELIVERY PARTNER ROLE --- */}
                    {userInfo.role === "delivery_partner" && (
                      <Link
                        to="/delivery-dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-blue-400 hover:bg-gray-800"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Truck size={16} /> Delivery Panel
                      </Link>
                    )}

                    <div className="border-t border-gray-700 my-1"></div>

                    {/* STANDARD USER LINKS */}
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User size={16} /> Profile
                    </Link>

                    <Link
                      to="/myorders"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Package size={16} /> My Orders
                    </Link>

                    <button
                      onClick={logoutHandler}
                      className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-primary hover:bg-red-600 text-white px-6 py-2 rounded-full font-bold transition-all shadow-lg shadow-primary/20"
              >
                Login
              </Link>
            )}
          </div>

          {/* 3. MOBILE MENU BUTTON */}
          <div className="md:hidden flex items-center">
            <Link to="/cart" className="relative text-gray-300 mr-6">
              <ShoppingCart size={24} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartItems.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. MOBILE MENU DROPDOWN */}
      {isOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-4 pt-2 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block text-gray-300 hover:text-white py-2 font-bold"
          >
            Home
          </Link>

          {userInfo ? (
            <>
              {userInfo.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-yellow-400 py-2 font-bold"
                >
                  <LayoutDashboard size={18} /> Admin Dashboard
                </Link>
              )}

              {userInfo.role === "restaurant_owner" && (
                <Link
                  to="/restaurant-dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-orange-400 py-2 font-bold"
                >
                  <Store size={18} /> Restaurant Panel
                </Link>
              )}

              {userInfo.role === "delivery_partner" && (
                <Link
                  to="/delivery-dashboard"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 text-blue-400 py-2 font-bold"
                >
                  <Truck size={18} /> Delivery Panel
                </Link>
              )}

              <Link
                to="/profile"
                className="flex items-center gap-2 text-gray-300 hover:text-white py-2 font-bold"
                onClick={() => setIsOpen(false)}
              >
                <User size={18} /> Profile
              </Link>
              <Link
                to="/myorders"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 text-gray-300 hover:text-white py-2 font-bold"
              >
                <Package size={18} /> My Orders
              </Link>
              <button
                onClick={logoutHandler}
                className="flex items-center gap-2 w-full text-left text-red-400 py-2 font-bold"
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block text-primary font-bold py-2"
            >
              Login / Register
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
