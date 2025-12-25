import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"; // Axios import karna zaroori hai

// 🌐 API URL Setup
const BACKEND_URL = "http://localhost:8000"; // Development ke liye

const initialState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
  loading: false,
  error: null,
  success: false,
};

// 👇 1. UPDATE PROFILE ACTION (Ye backend ko call karega)
export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (userData, { getState, rejectWithValue }) => {
    try {
      const {
        user: { userInfo },
      } = getState();

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      // Backend API Call
      const { data } = await axios.put(
        `${BACKEND_URL}/api/v1/users/profile`,
        userData,
        config
      );

      return data; // Ye data niche 'fulfilled' me jayega
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem("userInfo");
      state.success = false;
      state.error = null;
    },
  },
  // 👇 2. EXTRA REDUCERS (Yahan Redux state update hoti hai)
  extraReducers: (builder) => {
    builder
      // Update Profile Cases
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null; // Purana error saaf karo
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.userInfo = action.payload; // ✅ YAHAN UPDATE HOTA HAI MAGIC
        localStorage.setItem("userInfo", JSON.stringify(action.payload)); // LocalStorage bhi update
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCredentials, logout } = userSlice.actions;

export default userSlice.reducer;
