// src/context/StatesContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import coreApi from "../api/core";

const StatesContext = createContext();

export const StatesProvider = ({ children }) => {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStates = async () => {
    try {
      setLoading(true);
      const { data } = await coreApi.get("http://127.0.0.1:8000/states/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      setStates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Failed to fetch states:", err);
      setStates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates(); // ✅ fetch once when app loads
  }, []);

  return (
    <StatesContext.Provider value={{ states, loading, fetchStates }}>
      {children}
    </StatesContext.Provider>
  );
};

export const useStates = () => useContext(StatesContext);
