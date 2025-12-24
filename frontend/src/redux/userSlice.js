import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // LocalStorage check karein agar user pehle se login hai
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // 👇 Ye raha wo function jo missing tha
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
    },
    // 👇 Logout function
    logout: (state) => {
      state.userInfo = null;
      localStorage.removeItem("userInfo");
    },
  },
});

// 👇 Actions ko export karein taaki Register/Login page use kar sake
export const { setCredentials, logout } = userSlice.actions;

export default userSlice.reducer;
