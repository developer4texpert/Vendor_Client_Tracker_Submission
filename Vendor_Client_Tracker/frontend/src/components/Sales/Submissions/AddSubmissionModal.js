import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import SubmissionService from "../../../api/submissionsApi";
import coreApi from "../../../api/core";

export default function AddSubmissionModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [consultants, setConsultants] = useState([]);
  const [marketers, setMarketers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [attachedVendors, setAttachedVendors] = useState([]);

  const [form, setForm] = useState({
    ConsultantId: "",
    VendorId: "",
    PrimeVendorId: "",
    ImplementationPartnerId: "",
    ClientId: "",
    Marketer: "",
    SkillId: "",
    Comments: "",
  });

  // Fetch data for dropdowns
  const fetchDropdownData = async () => {
    try {
      const tokenHeader = {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
      };
      const [clientRes, vendorRes, skillRes, consultantRes, marketerRes] = await Promise.all([
        coreApi.get("client/GetClient/", tokenHeader),
        coreApi.get("vendor/GetVendor/", tokenHeader),
        coreApi.get("sale/GetSkill/", tokenHeader),
        coreApi.get("sale/GetAllConsultants/", tokenHeader),
        coreApi.get("admin/GetMarketer/", tokenHeader),
      ]);

      setClients(clientRes.data || []);
      setVendors(vendorRes.data.data || []);
      setSkills(skillRes.data.skills || []);
      setConsultants(consultantRes.data.consultants || []);
      setMarketers(marketerRes.data.marketers || []);
      setLoading(false);
    } catch (err) {
      console.error("Error loading dropdown data:", err);
      setLoading(false);
    }
  };



  // Fetch attached vendors for selected client
  const fetchAttachedVendors = async (clientId) => {
  if (!clientId) return;
  try {
    const tokenHeader = {
      headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
    };
    const res = await coreApi.post(`client/AttachVendor/${clientId}/`, {}, tokenHeader);
    console.log("Attached vendors for client:", res.data.attached_vendors);
    setAttachedVendors(res.data.attached_vendors || []);
  } catch (err) {
    console.error("Error fetching attached vendors:", err);
  }
};

  useEffect(() => {
    if (open) {
      fetchDropdownData();
    }
  }, [open]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // When a client changes, reload attached vendors
    if (name === "ClientId") {
      fetchAttachedVendors(value);
    }
  };

  const handleSubmit = async () => {
    try {
      await SubmissionService.add(form);
      onClose();
      onSuccess && onSuccess(); // refresh main table
    } catch (err) {
      console.error("Error adding submission:", err);
    }
  };

  if (loading)
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent sx={{ textAlign: "center", py: 5 }}>
          <CircularProgress color="primary" />
        </DialogContent>
      </Dialog>
    );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Submission</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 1, mt: 1 }}>
          {/* Consultant */}
          <TextField
            select
            label="Consultant"
            name="ConsultantId"
            value={form.ConsultantId}
            onChange={handleChange}
          >
            {consultants.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.first_name} {c.last_name}
              </MenuItem>
            ))}
          </TextField>

          {/* Skill */}
          <TextField
            select
            label="Skill"
            name="SkillId"
            value={form.SkillId}
            onChange={handleChange}
          >
            {skills.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Client */}
          <TextField
            select
            label="Client"
            name="ClientId"
            value={form.ClientId}
            onChange={handleChange}
          >
            {clients.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Vendor */}
         <TextField
  select
  label="Vendor"
  name="VendorId"
  value={form.VendorId}
  onChange={handleChange}
>
  {vendors.length > 0 ? (
    vendors.map((v) => (
      <MenuItem key={v.id} value={v.id}>
        {v.name}
      </MenuItem>
    ))
  ) : (
    <MenuItem disabled>No vendors found</MenuItem>
  )}
</TextField>
  {/* Prime Vendor */}
<TextField
  select
  label="Prime Vendor"
  name="PrimeVendorId"
  value={form.PrimeVendorId}
  onChange={handleChange}
>
  {attachedVendors
    .filter((v) => v.role === "Prime Vendor")
    .map((v) => (
      <MenuItem key={v.vendor_id} value={v.vendor_id}>
        {v.vendor__name}
      </MenuItem>
    ))}
  {attachedVendors.filter((v) => v.role === "Prime Vendor").length === 0 && (
    <MenuItem disabled>No Prime Vendor found</MenuItem>
  )}
</TextField>

{/* Implementation Partner */}
<TextField
  select
  label="Implementation Partner"
  name="ImplementationPartnerId"
  value={form.ImplementationPartnerId}
  onChange={handleChange}
>
  {attachedVendors
    .filter((v) => v.role === "Implementation Partner")
    .map((v) => (
      <MenuItem key={v.vendor_id} value={v.vendor_id}>
        {v.vendor__name}
      </MenuItem>
    ))}
  {attachedVendors.filter((v) => v.role === "Implementation Partner").length === 0 && (
    <MenuItem disabled>No Implementation Partner found</MenuItem>
  )}
</TextField>

          

          {/* Marketer */}
          <TextField
            select
            label="Marketer"
            name="Marketer"
            value={form.Marketer}
            onChange={handleChange}
          >
            {marketers.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.name}
              </MenuItem>
            ))}
          </TextField>

          {/* Comments */}
          <TextField
            label="Comments"
            name="Comments"
            value={form.Comments}
            onChange={handleChange}
            multiline
            rows={2}
          />
        </Box>

        <Box sx={{ textAlign: "right", mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ bgcolor: "#0ea5e9" }}>
            Submit
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
