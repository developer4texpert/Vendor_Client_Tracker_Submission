import React from "react";
import { Dialog, DialogTitle, DialogContent, Typography, Box } from "@mui/material";

export default function SubmissionDetailsModal({ open, onClose, data }) {
  if (!data) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Submission Details</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 1, mt: 1 }}>
          <Typography><strong>Consultant:</strong> {data.consultant_name}</Typography>
          <Typography><strong>Skill:</strong> {data.skill_name}</Typography>
          <Typography><strong>Vendor:</strong> {data.vendor_name}</Typography>
          <Typography><strong>Client:</strong> {data.end_client_name}</Typography>
          <Typography><strong>Marketer:</strong> {data.marketer_name}</Typography>
          <Typography><strong>Status:</strong> {data.vendor_response}</Typography>
          <Typography><strong>Comments:</strong> {data.comments}</Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
