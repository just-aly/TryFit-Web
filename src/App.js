import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./Components/LandingPage";
import LoginPage from "./Components/LoginPage";
import SignUpPage from "./Components/SignUpPage";
import './App.css';

//Header
import Header from "./Components/Header";
import MyOrders from "./Components/MyOrdes";
import Profile from "./Components/Profile";
import Notification from "./Components/Notification";
import Cart from "./Components/Cart";
import Categories from "./Components/Categories";

// Footer 
import Footer from "./Components/Footer";
import ContactUs from "./Components/ContactUs";
import ChatSupport from "./ChatSupport";


function AppContent() {
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <>
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
        <Route path="/contactus" element={<ContactUs />} />
      </Routes>

      <Footer />

      {!isAuthPage && <ChatSupport />}
    </>
  );
}

export default function App() {
  return <AppContent />;
}
