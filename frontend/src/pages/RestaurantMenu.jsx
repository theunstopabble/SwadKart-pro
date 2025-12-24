import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { Star, MapPin, Clock, Plus } from "lucide-react";
import { BASE_URL } from "../config"; // 👈 IMPORT IMPORTANT

const RestaurantMenu = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching for ID:", id);

        // 👇 FIXED: Using BASE_URL and Correct Routes
        // 1. Restaurant Details (User Routes se aayega) -> /api/v1/users/:id
        // 2. Menu Items (Product Routes se aayega) -> /api/v1/products/restaurant/:id
        const [restaurantRes, menuRes] = await Promise.all([
          fetch(`${BASE_URL}/api/v1/users/${id}`),
          fetch(`${BASE_URL}/api/v1/products/restaurant/${id}`),
        ]);

        if (!restaurantRes.ok) throw new Error("Restaurant not found");

        const restaurantData = await restaurantRes.json();
        const menuData = await menuRes.json();

        // --- 1. SET RESTAURANT ---
        setRestaurant(restaurantData.data || restaurantData);

        // --- 2. SET MENU (SMART CHECK) ---
        if (Array.isArray(menuData)) {
          setMenu(menuData);
        } else if (menuData.products && Array.isArray(menuData.products)) {
          setMenu(menuData.products);
        } else if (menuData.data && Array.isArray(menuData.data)) {
          setMenu(menuData.data);
        } else {
          setMenu([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddToCart = (item) => {
    if (!userInfo) {
      alert("Please Login to order food! 🍔");
      navigate("/login");
    } else {
      dispatch(addToCart({ ...item, qty: 1 }));
      alert(`${item.name} added to cart! 🛒`);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white flex justify-center items-center">
        <div className="animate-pulse text-xl font-bold text-primary">
          Loading Delicious Menu... 🍕
        </div>
      </div>
    );

  return (
    <div className="bg-black min-h-screen text-white pb-20 pt-16">
      {/* Banner Section */}
      {restaurant && (
        <div className="relative h-72 w-full">
          <img
            src={
              restaurant.image ||
              "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80"
            }
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-8 max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-2 tracking-tight text-white shadow-lg">
              {restaurant.name}
            </h1>
            <p className="text-gray-300 text-lg flex items-center gap-4">
              <span className="bg-green-600 px-2 py-0.5 rounded text-sm font-bold flex items-center gap-1">
                <Star size={12} fill="currentColor" />{" "}
                {restaurant.rating || "4.5"}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={16} /> {restaurant.location || "Jaipur"}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} /> 30-40 mins
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-8 border-l-4 border-primary pl-4 flex items-center gap-2">
          Menu Items{" "}
          <span className="text-sm bg-gray-800 text-gray-400 px-2 py-1 rounded-full">
            {menu.length}
          </span>
        </h2>

        {menu.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed">
            <p className="text-gray-400 text-xl font-bold">
              No food items listed yet. 🍛
            </p>
            <p className="text-sm text-gray-500 mt-2">
              The restaurant hasn't updated their menu online.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {menu.map((item) => (
              <div
                key={item._id}
                className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/10 group flex flex-col"
              >
                {/* Image Area */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={
                      item.image || "https://placehold.co/600x400?text=No+Image"
                    }
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {item.isVeg ? (
                    <span className="absolute top-3 right-3 bg-green-900/80 text-green-400 text-xs font-bold px-2 py-1 rounded border border-green-500">
                      VEG
                    </span>
                  ) : (
                    <span className="absolute top-3 right-3 bg-red-900/80 text-red-400 text-xs font-bold px-2 py-1 rounded border border-red-500">
                      NON-VEG
                    </span>
                  )}
                </div>

                {/* Details Area */}
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-primary font-bold text-lg">
                      ₹{item.price}
                    </p>
                  </div>

                  <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-1">
                    {item.description}
                  </p>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="w-full bg-white hover:bg-green-500 hover:text-white text-black font-extrabold py-3 rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-wide flex justify-center items-center gap-2"
                  >
                    ADD <Plus size={18} strokeWidth={3} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantMenu;
