import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cartItems: [], // Shuru mein cart khali rahega
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      // Check karo item pehle se hai kya?
      const itemExists = state.cartItems.find(
        (item) => item._id === action.payload._id
      );

      if (itemExists) {
        // Agar hai, toh quantity badha do (Logic hum baad me deep me karenge)
        alert("Item already in cart! 🍔");
      } else {
        // Naya item list mein jod do
        state.cartItems.push({ ...action.payload, qty: 1 });
        alert(`${action.payload.name} added to cart! 🛒`);
      }
    },
    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
    },
  },
});

export const { addToCart, removeFromCart } = cartSlice.actions;
export default cartSlice.reducer;
