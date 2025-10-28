// src/components/Vendors/VendorDetails.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Paper,
  Stack,
  Avatar,
  Chip,
  Button,
  Tabs,
  Tab,
  Tooltip,
  TextField,
  Snackbar,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { LoadingButton } from "@mui/lab";
import coreApi from "../../api/core";
import VendorAddresses from "./VendorAddresses";
import VendorContacts from "./VendorContacts";
import { useStates } from "../../context/StatesContext";

const paths = {
  vendor: {
    get: (id) => `vendor/GetVendorByID/${id}/`,
    update: (id) => `vendor/UpdateVendor/${id}/`,
    delete: (id) => `vendor/DeleteVendor/${id}/`,
  },
};

const VendorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, msg: "", type: "success" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { states, loading: statesLoading, fetchStates } = useStates();
  console.log("✅ states from context:", states);

  useEffect(() => {
    if (fetchStates) fetchStates();
  }, []);

  const initials = (name = "") =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const fetchVendor = async () => {
    try {
      const res = await coreApi.get(paths.vendor.get(id), {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      setVendor(res.data.data); // ✅ use inner data
    } catch (e) {
      console.error("❌ Error fetching vendor", e.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendor();
  }, [id]);

  const handleDelete = async () => {
    try {
      setSaving(true);
      await coreApi.delete(paths.vendor.delete(id), {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      setSnackbar({ open: true, msg: "Vendor deleted successfully", type: "success" });
      setTimeout(() => navigate("/dashboard/vendors"), 1500);
    } catch (e) {
      console.error("❌ Failed to delete vendor", e);
      setSnackbar({ open: true, msg: "Failed to delete vendor", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true); // ⏳ show loading spinner immediately

      // Simulate minimum 2-second loading (to give visible feedback)
      const delay = new Promise((resolve) => setTimeout(resolve, 2000));

      // Send PATCH request and wait along with 2s delay
      const req = coreApi.patch(paths.vendor.update(id), vendor, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });

      const [res] = await Promise.all([req, delay]);

      // ✅ After both request + delay complete
      console.log("✅ Vendor updated:", res.data);

      setSnackbar({
        open: true,
        msg: "Vendor details updated successfully",
        type: "success",
      });

      // Optional: refresh details
      await fetchVendor();

      // ✅ Close edit mode after showing success
      setEditMode(false);
    } catch (e) {
      console.error("❌ Failed to update vendor", e.response?.data || e.message);
      setSnackbar({
        open: true,
        msg: `❌ Failed to update vendor: ${e.response?.data?.detail || e.message
          }`,
        type: "error",
      });
    } finally {
      setSaving(false); // hide loader
    }
  };


  if (loading) {
    return (
      <Box sx={{ p: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!vendor) {
    return (
      <Box sx={{ p: 6 }}>
        <Typography variant="h6">Vendor not found</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/dashboard/vendors")}
        >
          Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          borderRadius: 4,
          mb: 3,
          background:
            "linear-gradient(135deg, rgba(14,165,233,0.12), rgba(99,102,241,0.12))",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
              {initials(vendor.name)}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {vendor.name}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip
                  label={vendor.status || "active"}
                  color={vendor.status === "inactive" ? "default" : "success"}
                  size="small"
                />
                {vendor.created_at && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <CalendarTodayIcon fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(vendor.created_at).toLocaleDateString()}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Box>
          </Stack>

          {/* Buttons */}
          {/* Header Buttons */}
          <Stack direction="row" spacing={1}>
            {!editMode && (
              <>
                <Tooltip title="Edit">
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                  >
                    Edit
                  </Button>
                </Tooltip>
                <Tooltip title="Delete">
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={saving}
                  >
                    Delete
                  </Button>
                </Tooltip>
              </>
            )}
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/dashboard/vendors")}
            >
              Back
            </Button>
          </Stack>

        </Stack>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ p: 2, borderRadius: 4 }}>
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
        >
          <Tab label="Overview" />
          <Tab label="Addresses" />
          <Tab label="Contacts" />
        </Tabs>

        {/* Overview Tab */}
        {tab === 0 && (
          !editMode ? (
            <>
              <Typography fontWeight={600}>Address</Typography>
              <Typography variant="body2">
                {[
                  vendor.street_address,
                  vendor.city,
                  (states.find((s) => s.abbr === vendor.state)?.name || vendor.state),
                  vendor.zipcode,
                ]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </Typography>

              <Typography fontWeight={600} sx={{ mt: 2 }}>
                LinkedIn URL
              </Typography>
              {vendor.linkedin_url ? (
                <Typography variant="body2">
                  <a
                    href={vendor.linkedin_url.startsWith("http")
                      ? vendor.linkedin_url
                      : `https://${vendor.linkedin_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#0A66C2", textDecoration: "none", fontWeight: 500 }}
                  >
                    {vendor.linkedin_url}
                  </a>
                </Typography>
              ) : (
                <Typography variant="body2">-</Typography>
              )}



              <Typography fontWeight={600} sx={{ mt: 2 }}>
                Notes
              </Typography>
              <Typography variant="body2">{vendor.notes || "-"}</Typography>
            </>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                gap: 2,
                maxWidth: 900,
                mx: "auto",
                mt: 1,
              }}
            >
              {/* 👇 Your existing edit form fields */}
              <TextField
                label="Vendor Name"
                size="small"
                value={vendor.name || ""}
                onChange={(e) => setVendor({ ...vendor, name: e.target.value })}
              />
              <TextField
                label="Street Address"
                size="small"
                value={vendor.street_address || ""}
                onChange={(e) =>
                  setVendor({ ...vendor, street_address: e.target.value })
                }
              />
              <TextField
                label="City"
                size="small"
                value={vendor.city || ""}
                onChange={(e) => setVendor({ ...vendor, city: e.target.value })}
              />

              <FormControl fullWidth size="small">
                <InputLabel id="state-label">State</InputLabel>
                <Select
                  fullWidth
                  labelId="state-label"
                  id="state-select"
                  label="State"
                  value={vendor.state || ""}
                  onChange={(e) => setVendor({ ...vendor, state: e.target.value })}
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
                size="small"
                value={vendor.country || ""}
                onChange={(e) => setVendor({ ...vendor, country: e.target.value })}
              />
              <TextField
                label="Zip Code"
                size="small"
                value={vendor.zipcode || ""}
                onChange={(e) => setVendor({ ...vendor, zipcode: e.target.value })}
              />

              <TextField
                label="LinkedIn URL"
                size="small"
                fullWidth
                value={vendor.linkedin_url || ""}
                onChange={(e) => setVendor({ ...vendor, linkedin_url: e.target.value })}
                placeholder="https://www.linkedin.com/company/vendor-name/"
                sx={{ gridColumn: "1 / -1" }}
              />

              <TextField
                label="Notes"
                size="small"
                multiline
                minRows={2}
                fullWidth
                value={vendor.notes || ""}
                onChange={(e) => setVendor({ ...vendor, notes: e.target.value })}
                sx={{ gridColumn: "1 / -1" }}
              />

              <Box
                sx={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 1,
                }}
              >
                <Button variant="outlined" onClick={() => setEditMode(false)}>
                  Cancel
                </Button>
                <LoadingButton
                  loading={saving}
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                >
                  Update
                </LoadingButton>
              </Box>
            </Box>
          )
        )}


        {tab === 1 && <VendorAddresses vendorId={id} />}
        {tab === 2 && <VendorContacts vendorId={id} />}
      </Paper>

      {/* 🆕 Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this vendor?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <LoadingButton
            color="error"
            onClick={async () => {
              setDeleting(true);
              await new Promise((r) => setTimeout(r, 2000)); // ⏳ wait 2s
              await handleDelete(); // ✅ reuse your existing delete logic
              setDeleting(false);
              setDeleteDialogOpen(false);
            }}
            loading={deleting}
            variant="contained"
          >
            Confirm
          </LoadingButton>
        </DialogActions>
      </Dialog>


      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.type}>{snackbar.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default VendorDetails;
