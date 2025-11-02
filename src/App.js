import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./Components/LandingPage";
import LoginPage from "./Components/LoginPage";
import SignUpPage from "./Components/SignUpPage";
import Checkout from "./Components/Checkout";
import ChatComponent from "./Components/ChatComponent";
import ChatSupport from "./ChatSupport";
import './App.css';

import Header from "./Components/Header";
import MyOrders from "./Components/MyOrdes";
import Profile from "./Components/Profile";
import Notification from "./Components/Notification";
import Cart from "./Components/Cart";
import Categories from "./Components/Categories";

import Footer from "./Components/Footer";
import ContactUs from "./Components/ContactUs";
import TermsOfService from "./Components/TermsOfService";
import PrivacyAndPolicy from "./Components/PrivacyPolicy";
import AboutUs from "./Components/AboutUs";
import ProductDetails from "./Components/ProductDetails";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" }), [pathname]);
  return null;
}

function AppContent() {
  const location = useLocation();
  const [showChat, setShowChat] = useState(false);
  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <>
      <ScrollToTop />
      {!isAuthPage && <Header />}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/myorders" element={<MyOrders />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/termsofservice" element={<TermsOfService />} />
        <Route path="/privacyandpolicy" element={<PrivacyAndPolicy />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/product/:productId" element={<ProductDetails />} />
      </Routes>
      <Footer />

      {!isAuthPage && (
        <>
          <ChatSupport showChat={showChat} setShowChat={setShowChat} />
          {showChat && <ChatComponent onClose={() => setShowChat(false)} />}
        </>
      )}
    </>
  );
}

export default function App() {
  return <AppContent />;
}
