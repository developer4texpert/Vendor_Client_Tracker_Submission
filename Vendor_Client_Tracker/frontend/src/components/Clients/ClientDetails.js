// src/components/Clients/ClientDetails.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Stack,
  Avatar,
  Chip,
  Button,
  Tabs,
  Tab,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import coreApi from "../../api/core";
import ClientAddresses from "./ClientAddresses";
import ClientVendors from "./ClientVendors";
import UpdateClientForm from "./UpdateClientForm";

const DELETE_URL = (id) => `client/DeleteClient/${id}/`;

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, msg: "", type: "success" });

  const initials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  // ✅ Fetch client details
  const fetchClient = async () => {
    try {
      const res = await coreApi.get(`client/GetClientByID/${id}/`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      });
      setClient(res.data);
    } catch (e) {
      console.error("❌ Error fetching client", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClient();
  }, [id]);

  // ✅ Delete client (with 2s loader)
  const handleDelete = async () => {
    try {
      setSaving(true);
      await Promise.all([
        coreApi.delete(DELETE_URL(id), {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        }),
        new Promise((r) => setTimeout(r, 2000)), // simulate loader
      ]);

      setSnackbar({
        open: true,
        msg: "Client deleted successfully",
        type: "success",
      });

      setTimeout(() => {
        navigate("/dashboard/clients");
      }, 1500);
    } catch (e) {
      console.error("❌ Failed to delete client", e);
      setSnackbar({ open: true, msg: "Failed to delete client", type: "error" });
    } finally {
      setSaving(false);
      setDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!client) {
    return (
      <Box sx={{ p: 6 }}>
        <Typography variant="h6">Client not found</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/dashboard/clients")}
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
            "linear-gradient(90deg, rgba(219,234,254,0.6), rgba(233,213,255,0.6))",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main" }}>
              {initials(client.name)}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {client.name}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip label="Active" color="success" size="small" />
                <Chip
                  label={client.domain_name || "No Domain"}
                  color="primary"
                  size="small"
                />
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <CalendarTodayIcon fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(client.created_at).toLocaleDateString()}
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>

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
                    onClick={() => setDeleteOpen(true)}
                  >
                    Delete
                  </Button>
                </Tooltip>
              </>
            )}
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/dashboard/clients")}
            >
              Back
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Tabs */}
      {editMode ? (
        <UpdateClientForm
          client={client}
          onCancel={() => setEditMode(false)}
          onUpdated={() => {
            setEditMode(false);
            fetchClient(); // ✅ reload updated details
          }}
        />
      ) : (
        <Paper sx={{ p: 2, borderRadius: 4 }}>
          <Tabs
            value={tab}
            onChange={(e, v) => setTab(v)}
            sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
          >
            <Tab label="Overview" />
            <Tab label="Addresses" />
            <Tab label="Vendors" />
          </Tabs>

          {tab === 0 && (
            <Box>
              <Typography fontWeight={600}>Domain</Typography>
              <Typography variant="body2">{client.domain_name || "-"}</Typography>
              <Divider sx={{ my: 1 }} />
              <Typography fontWeight={600}>Address</Typography>
              <Typography variant="body2" color="text.secondary">
                {[
                  client.street_address,
                  client.city,
                  client.state,
                  client.zipcode,
                  client.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </Typography>
            </Box>
          )}
          {tab === 1 && <ClientAddresses clientId={id} />}
          {tab === 2 && <ClientVendors clientId={id} />}
        </Paper>
      )}

      {/* ✅ Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle sx={{ fontWeight: "bold" }}>Confirm Delete</DialogTitle>
        <DialogContent dividers>
          <Typography>Are you sure you want to delete this client?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {saving ? "Deleting..." : "Confirm"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Snackbar Notification */}
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

export default ClientDetails;
