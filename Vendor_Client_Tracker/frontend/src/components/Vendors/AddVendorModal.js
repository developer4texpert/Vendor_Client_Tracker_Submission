// src/components/Vendors/AddVendorModal.js
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
    CircularProgress,
    Backdrop,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import coreApi from "../../api/core";
import { useStates } from "../../context/StatesContext";

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AddVendorModal = ({ open, onClose }) => {
    const [formData, setFormData] = useState({
        name: "",
        street_address: "",
        city: "",
        state: "",
        country: "",
        zipcode: "",
        status: "active",
        website: "",
        notes: "",
    });

    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({
        open: false,
        msg: "",
        severity: "success",
    });

    const { states, loading: statesLoading, fetchStates } = useStates();

    useEffect(() => {
        if (fetchStates) fetchStates();
    }, []);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleCancel = () => {
        setFormData({
            name: "",
            street_address: "",
            city: "",
            state: "",
            country: "",
            zipcode: "",
            status: "active",
            website: "",
            notes: "",
        });
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const req = coreApi.post("vendor/AddVendor/", formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
            });

            // ⏳ force loader for 2 seconds
            await Promise.all([req, new Promise((res) => setTimeout(res, 2000))]);

            // ✅ refresh vendor list
            window.dispatchEvent(new Event("vendorAdded"));

            setSnackbar({
                open: true,
                msg: "✅ Vendor added successfully",
                severity: "success",
            });
            handleCancel(); // close modal + reset
        } catch (err) {
            console.error("❌ Failed to add vendor", err);
            setSnackbar({
                open: true,
                msg: "❌ Failed to add vendor",
                severity: "error",
            });
        } finally {
            setSaving(false); // hide loader
        }
    };

    return (
        <>
            <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: "bold" }}>Add New Vendor</DialogTitle>
                <DialogContent dividers sx={{ position: "relative" }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            <TextField
                                label="Vendor Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                            <TextField
                                label="Street Address"
                                name="street_address"
                                value={formData.street_address}
                                onChange={handleChange}
                            />
                            <TextField
                                label="City"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                            />
                            <FormControl fullWidth>
                                <InputLabel id="state-label">State</InputLabel>
                                <Select
                                    labelId="state-label"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                >
                                    {statesLoading ? (
                                        <MenuItem disabled>Loading states...</MenuItem>
                                    ) : (
                                        states.map((s) => (
                                            <MenuItem key={s.abbr} value={s.abbr}>
                                                {s.name} ({s.abbr})
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                            <TextField
                                label="Country"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                            />
                            <TextField
                                label="Zip Code"
                                name="zipcode"
                                value={formData.zipcode}
                                onChange={handleChange}
                            />
                            <TextField
                                select
                                label="Status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                fullWidth
                            >
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </TextField>
                            <TextField
                                label="Website"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                placeholder="example.com"
                            />
                            <TextField
                                label="Notes"
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                fullWidth
                                multiline
                                minRows={3}
                            />
                        </Box>
                {/* ✅ Overlay loader */}
  {saving && (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255,255,255,0.6)", // translucent background
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        zIndex: 10,
      }}
    >
      <CircularProgress size={50} />
      <Typography variant="body2" sx={{ mt: 2 }}>
        Processing...
      </Typography>
    </Box>
  )}
        </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancel} color="error">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={saving}
                    >
                        {saving ? "Adding..." : "Confirm"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ✅ Snackbar popup */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity={snackbar.severity}>{snackbar.msg}</Alert>
            </Snackbar>

            {/* ✅ Loader overlay */}
            <Backdrop open={saving} sx={{ color: "#fff", zIndex: 1300 }}>
                <CircularProgress color="inherit" size={70} />
            </Backdrop>
        </>
    );
};

export default AddVendorModal;
