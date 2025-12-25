import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  Image,
  BackHandler, // Back button handle karne ke liye
} from "react-native";

export default function HomeScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Data States
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null); // Abhi kaunsa restaurant khula hai
  const [menu, setMenu] = useState([]); // Us restaurant ka khana
  const [menuLoading, setMenuLoading] = useState(false);

  // 👇 YAHAN APNA RENDER URL DALEIN
  const BACKEND_URL = "https://swadkart-backend.onrender.com";

  // ====================================================
  // 🔐 1. LOGIN LOGIC
  // ====================================================
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
      } else {
        Alert.alert("Login Failed", data.message || "Invalid credentials");
      }
    } catch (error) {
      Alert.alert("Connection Error", "Check internet or Backend URL");
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // 🏠 2. FETCH RESTAURANTS
  // ====================================================
  useEffect(() => {
    if (user) {
      fetchRestaurants();
    }
  }, [user]);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/users/restaurants`);
      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      console.log("Error fetching restaurants:", error);
    }
  };

  // ====================================================
  // 🍕 3. FETCH MENU (Jab Restaurant Click ho)
  // ====================================================
  const handleRestaurantClick = async (restaurant) => {
    setSelectedRestaurant(restaurant); // Restaurant select kiya
    setMenuLoading(true);
    setMenu([]); // Purana menu saaf karo

    try {
      // Backend se khana mangao
      const response = await fetch(
        `${BACKEND_URL}/api/v1/food/${restaurant._id}`
      );
      const data = await response.json();
      setMenu(data);
    } catch (error) {
      Alert.alert("Error", "Could not fetch menu");
    } finally {
      setMenuLoading(false);
    }
  };

  // Back Button Logic (Menu -> List)
  const handleBack = () => {
    setSelectedRestaurant(null);
    setMenu([]);
  };

  // ====================================================
  // 🎨 RENDER ITEMS (UI)
  // ====================================================

  // Restaurant Card
  const renderRestaurant = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => handleRestaurantClick(item)}
      style={styles.card}
    >
      <Image
        source={{
          uri:
            item.image ||
            "https://cdn-icons-png.flaticon.com/512/1996/1996068.png",
        }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description || "Best food in town! 😋"}
        </Text>
        <View style={styles.orderButton}>
          <Text style={styles.orderButtonText}>View Menu & Order</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Food Item Card
  const renderFoodItem = ({ item }) => (
    <View style={styles.foodCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodPrice}>₹{item.price}</Text>
        <Text style={styles.foodDesc} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      <View style={{ alignItems: "center" }}>
        <Image source={{ uri: item.image }} style={styles.foodImage} />
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>ADD +</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ====================================================
  // 📱 MAIN SCREENS
  // ====================================================

  // 1. MENU SCREEN (Agar Restaurant Selected hai)
  if (selectedRestaurant) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
            <Text style={{ color: "#fff", fontSize: 20 }}>⬅️ Back</Text>
          </TouchableOpacity>
          <Text style={styles.sectionTitle} numberOfLines={1}>
            {selectedRestaurant.name}
          </Text>
        </View>

        {menuLoading ? (
          <ActivityIndicator
            size="large"
            color="#f97316"
            style={{ marginTop: 50 }}
          />
        ) : menu.length === 0 ? (
          <View style={{ marginTop: 50, alignItems: "center" }}>
            <Text style={{ color: "#9ca3af" }}>
              No food items available yet 😕
            </Text>
          </View>
        ) : (
          <FlatList
            data={menu}
            keyExtractor={(item) => item._id}
            renderItem={renderFoodItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    );
  }

  // 2. RESTAURANT LIST SCREEN (Login hone par)
  if (user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.welcomeText}>
              Hello, {user.name.split(" ")[0]} 👋
            </Text>
            <Text style={styles.locationText}>📍 Jaipur, India</Text>
          </View>
          <TouchableOpacity
            onPress={() => setUser(null)}
            style={styles.logoutBtn}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Logout</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>🍽️ Nearby Restaurants</Text>

        {restaurants.length === 0 ? (
          <View style={{ marginTop: 50, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#f97316" />
          </View>
        ) : (
          <FlatList
            data={restaurants}
            keyExtractor={(item) => item._id}
            renderItem={renderRestaurant}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    );
  }

  // 3. LOGIN SCREEN (Default)
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loginContent}>
        <Text style={styles.logo}>
          Swad<Text style={{ color: "#fff" }}>Kart</Text> 
        </Text>
        <Text style={styles.header}>Login to App</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#9ca3af"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ✨ Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
    paddingTop: 40,
    paddingHorizontal: 15,
  },

  // Login
  loginContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  logo: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#f97316",
    marginBottom: 10,
  },
  header: { fontSize: 18, color: "#d1d5db", marginBottom: 30 },
  inputContainer: { width: "100%", marginBottom: 20 },
  input: {
    backgroundColor: "#1f2937",
    color: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#374151",
  },
  button: {
    backgroundColor: "#f97316",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  // Dashboard & Menu
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: { fontSize: 22, fontWeight: "bold", color: "#f97316" },
  locationText: { color: "#9ca3af", fontSize: 14 },
  logoutBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backBtn: { paddingVertical: 5 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 15,
    flex: 1,
  },

  // Restaurant Card
  card: {
    backgroundColor: "#1f2937",
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 3,
    borderWidth: 1,
    borderColor: "#374151",
  },
  cardImage: { width: "100%", height: 150 },
  cardContent: { padding: 15 },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  cardDesc: { color: "#9ca3af", fontSize: 14, marginBottom: 10 },
  orderButton: {
    backgroundColor: "#f97316",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  orderButtonText: { color: "#fff", fontWeight: "bold" },

  // Food Item Card (Menu)
  foodCard: {
    backgroundColor: "#1f2937",
    flexDirection: "row",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: "#374151",
  },
  foodName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  foodPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  foodDesc: { color: "#9ca3af", fontSize: 12 },
  foodImage: { width: 80, height: 80, borderRadius: 10, marginBottom: 5 },
  addButton: {
    backgroundColor: "#fff",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    position: "absolute",
    bottom: -10,
  },
  addButtonText: { color: "green", fontWeight: "bold", fontSize: 12 },
});
