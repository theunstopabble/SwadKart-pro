import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../redux/userSlice"; // Path check kar lein
import {
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = () => {
    dispatch(logout());
    setIsOpen(false);
    navigate("/login");
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="bg-gray-950 text-white border-b border-gray-800 fixed w-full z-50 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* 👇 LOGO FIX: 'gap-1' hata diya taaki space na rahe */}
          <Link
            to="/"
            className="text-2xl font-extrabold text-primary tracking-tight flex items-center"
            onClick={closeMenu}
          >
            Swad<span className="text-white">Kart</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="hover:text-primary transition-colors font-medium"
            >
              Home
            </Link>

            {userInfo ? (
              <>
                {userInfo.role === "admin" && (
                  <Link
                    to="/admin/dashboard"
                    className="hover:text-primary transition-colors font-medium"
                  >
                    Admin Panel
                  </Link>
                )}
                {userInfo.role === "restaurant_owner" && (
                  <Link
                    to="/restaurant-dashboard"
                    className="hover:text-primary transition-colors font-medium"
                  >
                    Kitchen Dashboard
                  </Link>
                )}
                {userInfo.role === "delivery_partner" && (
                  <Link
                    to="/delivery-dashboard"
                    className="hover:text-primary transition-colors font-medium"
                  >
                    Delivery Dashboard
                  </Link>
                )}
                {userInfo.role === "user" && (
                  <Link
                    to="/myorders"
                    className="hover:text-primary transition-colors font-medium"
                  >
                    My Orders
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-full border border-gray-700 hover:border-primary transition-all"
                >
                  <User size={18} />
                  <span className="text-sm font-bold truncate max-w-[100px]">
                    {userInfo.name.split(" ")[0]}
                  </span>
                </Link>

                <button
                  onClick={logoutHandler}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <div className="flex gap-4">
                <Link
                  to="/login"
                  className="text-white hover:text-primary font-bold"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold transition-all text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <Link to="/cart" className="relative group">
              <ShoppingCart
                size={24}
                className="text-gray-300 group-hover:text-primary transition-colors"
              />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <Link to="/cart" className="relative" onClick={closeMenu}>
              <ShoppingCart size={22} />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartItems.length}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-gray-900 border-b border-gray-800 animate-fade-in-down">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <Link
              to="/"
              className="block px-3 py-3 rounded-md text-base font-medium hover:bg-gray-800 hover:text-primary"
              onClick={closeMenu}
            >
              Home
            </Link>

            {userInfo ? (
              <>
                <Link
                  to="/profile"
                  className="block px-3 py-3 rounded-md text-base font-medium hover:bg-gray-800 hover:text-primary"
                  onClick={closeMenu}
                >
                  Profile ({userInfo.name})
                </Link>
                <button
                  onClick={logoutHandler}
                  className="w-full text-left block px-3 py-3 rounded-md text-base font-bold text-red-500 hover:bg-gray-800"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Link
                  to="/login"
                  className="text-center py-2 border border-gray-600 rounded-lg font-bold hover:bg-gray-800"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-center py-2 bg-primary text-white rounded-lg font-bold hover:bg-red-700"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
