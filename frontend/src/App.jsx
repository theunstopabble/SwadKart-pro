import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Shipping from "./pages/Shipping";
import Payment from "./pages/Payment";
import PlaceOrder from "./pages/PlaceOrder";
import OrderDetails from "./pages/OrderDetails";
import MyOrders from "./pages/MyOrders";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// 👇 Missing Import Add Kiya Hai
import RestaurantMenu from "./pages/RestaurantMenu";

import RestaurantOwnerDashboard from "./pages/RestaurantOwnerDashboard";
import DeliveryPartnerDashboard from "./pages/DeliveryPartnerDashboard";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />

        {/* 👇 YE WALA ROUTE AAPKA MISSING THA, ISLIYE ERROR AA RAHA THA */}
        <Route path="/restaurant/:id" element={<RestaurantMenu />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/shipping" element={<Shipping />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/placeorder" element={<PlaceOrder />} />
        <Route path="/order/:id" element={<OrderDetails />} />
        <Route path="/myorders" element={<MyOrders />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Auth Routes */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />

        {/* Role Based Dashboards */}
        <Route
          path="/restaurant-dashboard"
          element={<RestaurantOwnerDashboard />}
        />
        <Route
          path="/delivery-dashboard"
          element={<DeliveryPartnerDashboard />}
        />
      </Routes>
    </>
  );
}

export default App;
