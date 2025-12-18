import { Link } from "react-router-dom";
import { ShoppingBag, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const cartItems = useSelector((state) => state.cart.cartItems);

  return (
    <nav className="bg-secondary text-white sticky top-0 z-50 shadow-lg border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tighter">
              Swad<span className="text-primary">Kart</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <Link to="/menu" className="hover:text-primary transition-colors">
              Menu
            </Link>
            <Link to="/about" className="hover:text-primary transition-colors">
              About
            </Link>
          </div>

          {/* Right Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/cart" className="relative hover:text-primary">
              <ShoppingBag size={24} />
              {cartItems.length > 0 && ( // Sirf tab dikhao jab item ho
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                  {cartItems.length}
                </span>
              )}
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 bg-primary hover:bg-red-600 px-4 py-2 rounded-full font-semibold transition-all"
            >
              <User size={18} /> Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-gray-900 pb-4">
          <Link to="/" className="block px-4 py-2 hover:bg-gray-800">
            Home
          </Link>
          <Link to="/menu" className="block px-4 py-2 hover:bg-gray-800">
            Menu
          </Link>
          <Link to="/cart" className="block px-4 py-2 hover:bg-gray-800">
            Cart
          </Link>
          <Link to="/login" className="block px-4 py-2 text-primary font-bold">
            Login
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
