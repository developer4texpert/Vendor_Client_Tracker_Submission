// src/components/Clients/UpdateClientForm.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  Backdrop,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Divider,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useStates } from "../../context/StatesContext";
import coreApi from "../../api/core";

const UpdateClientForm = ({ client, onCancel, onUpdated }) => {
  const { states, loading: statesLoading, fetchStates } = useStates();

  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  // ✅ Initialize formData when client loads
  useEffect(() => {
    if (client) {
      setFormData({
        id: client.id,
        name: client.name || "",
        street_address: client.street_address || "",
        city: client.city || "",
        state: client.state || "", // should be abbr like "CT"
        country: client.country || "",
        zipcode: client.zipcode || "",
      });
    }
  }, [client]);

  // ✅ Fetch states once
  useEffect(() => {
    fetchStates && fetchStates();
  }, []);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleUpdate = async () => {
    try {
      setSaving(true);

      const payload = {
        name: formData.name,
        street_address: formData.street_address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipcode: formData.zipcode,
      };

      await coreApi.put(`client/UpdateClient/${formData.id}/`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });

      // Simulate 2s loading for UX
      setTimeout(() => {
        setSaving(false);
        setToast({
          open: true,
          msg: "✅ Client updated successfully",
          severity: "success",
        });

        // Wait for toast, then reload client details
        setTimeout(() => {
          if (onUpdated) onUpdated();
        }, 1000);
      }, 2000);
    } catch (e) {
      console.error("❌ Failed to update client", e);
      setSaving(false);
      setToast({
        open: true,
        msg: "❌ Failed to update client",
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Client Name"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Street Address"
            name="street_address"
            value={formData.street_address || ""}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="City"
            name="city"
            value={formData.city || ""}
            onChange={handleChange}
            fullWidth
          />
        </Grid>

        {/* ✅ State dropdown */}
        <Grid item xs={12} sm={6} md={4}>
  <FormControl fullWidth>
    <InputLabel id="state-label">State</InputLabel>

    {/* Render Select only when states are loaded */}
    {statesLoading ? (
      <Select labelId="state-label" value="">
        <MenuItem disabled>Loading states...</MenuItem>
      </Select>
    ) : (
      <Select
        labelId="state-label"
        name="state"
        value={formData.state || ""}
        onChange={handleChange}
        label="State"
      >
        {states.map((s) => (
          <MenuItem key={s.abbr} value={s.abbr}>
            {s.name} ({s.abbr})
          </MenuItem>
        ))}
      </Select>
    )}
  </FormControl>
</Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Country"
            name="country"
            value={formData.country || ""}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            label="Zip Code"
            name="zipcode"
            value={formData.zipcode || ""}
            onChange={handleChange}
            fullWidth
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          onClick={handleUpdate}
          loading={saving}
        >
          Update
        </LoadingButton>
      </Stack>

      {/* ✅ Snackbar */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity}>{toast.msg}</Alert>
      </Snackbar>

      {/* ✅ Center Loader */}
      <Backdrop
        open={saving}
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
};

export default UpdateClientForm;
