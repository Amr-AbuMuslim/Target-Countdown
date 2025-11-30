import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { Layout } from "./components/layout/Layout";
import { CountdownPage } from "./pages/CountdownPage";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/countdown" replace />} />
          <Route path="/countdown" element={<CountdownPage />} />
        </Routes>
      </Layout>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "white",
            color: "#374151",
            border: "1px solid #e5e7eb",
            borderRadius: "0.75rem",
            padding: "1rem",
            fontSize: "0.875rem",
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
