import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddClient() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipcode: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/client/AddClient/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          "Street address": formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          Zipcode: formData.zipcode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add client");
      }

      setLoading(false);
      navigate("/clients"); // redirect to clients page
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Error adding client");
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Add Client</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Name"
          className="w-full border p-2 rounded"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Street Address"
          className="w-full border p-2 rounded"
          value={formData.address}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          className="w-full border p-2 rounded"
          value={formData.city}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="state"
          placeholder="State"
          className="w-full border p-2 rounded"
          value={formData.state}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="country"
          placeholder="Country"
          className="w-full border p-2 rounded"
          value={formData.country}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="zipcode"
          placeholder="Zipcode"
          className="w-full border p-2 rounded"
          value={formData.zipcode}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Client"}
        </button>
      </form>
    </div>
  );
}
