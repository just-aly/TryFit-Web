import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import LandingPage from "./Components/LandingPage";
import LoginPage from "./Components/LoginPage";
import SignUpPage from "./Components/SignUpPage";
import Footer from "./Components/Footer";
import Header from "./Components/Header";
import Profile from "./Components/Profile";
import ChatSupport from "./ChatSupport";
import './App.css';

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
      </Routes>

      <Footer />

      {!isAuthPage && <ChatSupport />}
    </>
  );
}

export default function App() {
  return <AppContent />;
}
