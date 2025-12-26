import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import store from "./redux/store";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter } from "react-router-dom";
// 1. StatusBar इम्पोर्ट करें
import { StatusBar, Style } from "@capacitor/status-bar";

// Tumhari Client ID
const GOOGLE_CLIENT_ID =
  "681681246850-ji8nu3l06rrljbm1aeba6h79im01jm6n.apps.googleusercontent.com";

// 2. स्टेटस बार सेटअप फंक्शन
const setupStatusBar = async () => {
  try {
    // मोबाइल पर स्टेटस बार का टेक्स्ट सफेद रखेगा
    await StatusBar.setStyle({ style: Style.Dark });

    // यह सबसे ज़रूरी है: ऐप को स्टेटस बार के नीचे धकेल देगा (Overlay Off)
    await StatusBar.setOverlaysWebView({ overlay: false });

    // बैकग्राउंड कलर आपकी थीम (Gray-950) से मैच करता हुआ
    await StatusBar.setBackgroundColor({ color: "#030712" });
  } catch (error) {
    // अगर ब्राउज़र में चल रहा है तो एरर इग्नोर करेगा
    console.log("StatusBar not available on web");
  }
};

// फंक्शन कॉल करें
setupStatusBar();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </Provider>
  </React.StrictMode>
);
