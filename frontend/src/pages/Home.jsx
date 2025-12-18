import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Backend se data maang rahe hain
        const { data } = await axios.get(
          "https://swadkart-backend.onrender.com/api/products"
        );
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching food:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner (Welcome Text) */}
      <div className="text-center mb-12 animate-fade-in-down">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4">
          Hungry? <span className="text-primary">Order Now!</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Sabse tasty khana, seedha aapke ghar tak. Fast delivery, hot food. 🚀
        </p>
      </div>

      {/* Food Grid */}
      {loading ? (
        <div className="text-center text-primary text-xl font-bold animate-pulse">
          Loading delicious food... 🍔
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((food) => (
            <ProductCard key={food._id} product={food} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
