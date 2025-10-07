import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  Snackbar,
  InputLabel,
  FormControl,
  Button,
  Box,
  Typography,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import { Backdrop, CircularProgress } from "@mui/material";
import { addClient } from "../../api/clientsApi";
import { useStates } from "../../context/StatesContext";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AddClientModal = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    domain_id: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipcode: "",
  });

  const [domains, setDomains] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, msg: "", severity: "success" });
  const [loading, setLoading] = useState(false);
  const { states, loading: statesLoading, fetchStates } = useStates();

  // re-fetch states if modal opens and states list is empty
  useEffect(() => {
    if (open && states.length === 0 && !statesLoading) {
      fetchStates();
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      fetch("http://127.0.0.1:8000/client/domains/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      })
        .then((res) => res.json())
        .then((data) => {
          // 🔥 Always ensure it's an array
          if (Array.isArray(data)) {
            setDomains(data);
          } else if (Array.isArray(data?.results)) {
            setDomains(data.results);
          } else if (Array.isArray(data?.data)) {
            setDomains(data.data);
          } else {
            setDomains([]); // fallback
          }
        })
        .catch((err) => {
          console.error("❌ Failed to load domains", err);
          setDomains([]);
        });
    }
  }, [open]);


  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCancel = () => {
    setFormData({
      name: "",
      domain_id: "",
      address: "",
      city: "",
      state: "",
      country: "",
      zipcode: "",
    });
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // show loader immediately

    try {
      const payload = {
        name: formData.name,
        domain_id: formData.domain_id,
        street_address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipcode: formData.zipcode,
      };

      // simulate 2s delay for loader
      setTimeout(async () => {
        await addClient(payload);

        // 🔥 Trigger global event to refresh client list
        window.dispatchEvent(new Event("clientAdded"));

        // ✅ Close modal
        onClose();

        // ✅ Show success popup
        setSnackbar({
          open: true,
          msg: "✅ Client added successfully",
          severity: "success",
        });

        setLoading(false); // hide loader
      }, 2000);
    } catch (e) {
      console.error("❌ Failed to add client", e);

      setSnackbar({
        open: true,
        msg: "❌ Failed to add client",
        severity: "error",
      });

      setLoading(false);
    }
  };


  return (
    <>
      <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Client</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Client Name" name="name" value={formData.name} onChange={handleChange} required />

            <FormControl fullWidth required>
              <InputLabel>Domain</InputLabel>
              <Select
                name="domain_id"
                value={formData.domain_id || ""}
                onChange={handleChange}
                label="Domain"
              >
                {(domains || []).map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>



            <TextField label="Street Address" name="address" value={formData.address} onChange={handleChange} />
            <TextField label="City" name="city" value={formData.city} onChange={handleChange} />

            <FormControl fullWidth required>
              <InputLabel id="state-label">State</InputLabel>
              <Select
                labelId="state-label"
                name="state"
                value={formData.state}
                onChange={handleChange}
                label="State"
              >
                {statesLoading ? (
                  <MenuItem disabled>Loading states...</MenuItem>
                ) : states.length === 0 ? (
                  <MenuItem disabled>No states available</MenuItem>
                ) : (
                  states.map((s) => (
                    <MenuItem key={s.abbr} value={s.abbr}>
                      {s.name} ({s.abbr})
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>


            <TextField label="Country" name="country" value={formData.country} onChange={handleChange} />
            <TextField label="Zip Code" name="zipcode" value={formData.zipcode} onChange={handleChange} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="error">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? "Adding..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "center", horizontal: "center" }}  // 👈 Center screen
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.msg}
        </Alert>
      </Snackbar>


      <Backdrop open={loading} sx={{ color: "#fff", zIndex: 1500, flexDirection: "column" }}>
        <CircularProgress color="inherit" />
        <Typography sx={{ mt: 2 }}>Processing...</Typography>
      </Backdrop>

    </>
  );
};

export default AddClientModal;
