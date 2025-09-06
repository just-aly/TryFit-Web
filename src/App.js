import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./Components/LandingPage";
import LoginPage from "./Components/LoginPage";
import SignUpPage from "./Components/SignUpPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
    </Routes>
  );
}