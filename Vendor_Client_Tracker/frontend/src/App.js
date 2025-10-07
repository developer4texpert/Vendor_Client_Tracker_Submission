// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline, GlobalStyles } from "@mui/material";
import theme from "./theme";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Clients from "./components/Clients/Clients";
import ClientDetails from "./components/Clients/ClientDetails";
import Vendors from "./components/Vendors/Vendors";
import VendorDetails from "./components/Vendors/VendorDetails";
import Consultants from "./components/Consultants/Consultants";
import History from "./components/History/History";
import AddClient from "./components/Clients/AddClientModal";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("access");
  return token ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          body: {
            backgroundImage:
              "radial-gradient(48rem 20rem at 10% -10%, rgba(99,102,241,.08), transparent), radial-gradient(48rem 22rem at 90% 0%, rgba(14,165,233,.08), transparent)",
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          {/* Login Page */}
          <Route path="/" element={<Login />} />

          {/* Dashboard & Nested Pages */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            {/* Nested routes for pages */}
            <Route path="clients" element={<Clients />} />
            <Route path="clients/add" element={<AddClient />} />
            <Route path="clients/:id" element={<ClientDetails />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="vendors/:id" element={<VendorDetails />} />
            <Route path="consultants" element={<Consultants />} />
            <Route path="history" element={<History />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
