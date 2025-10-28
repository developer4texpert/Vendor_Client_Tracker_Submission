// src/components/Sales/Submissions/SubmissionsPage.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import SubmissionService from "../../../api/submissionsApi";
import AddSubmissionModal from "./AddSubmissionModal";
import SubmissionDetailsModal from "./SubmissionDetails";

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchSubmissions = async () => {
    try {
      const res = await SubmissionService.getAll();
      setSubmissions(res.data.submissions || []);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Submissions
      </Typography>

      <Button
        variant="contained"
        sx={{ bgcolor: "#0ea5e9", "&:hover": { bgcolor: "#0284c7" }, borderRadius: 2, mb: 2 }}
        onClick={() => setOpenAdd(true)}
      >
        + Add Submission
      </Button>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#f1f5f9" }}>
            <TableRow>
              <TableCell><strong>Consultant</strong></TableCell>
              <TableCell><strong>Skill</strong></TableCell>
              <TableCell><strong>Vendor</strong></TableCell>
              <TableCell><strong>Prime Vendor</strong></TableCell>
              <TableCell><strong>Client</strong></TableCell>
              <TableCell><strong>Marketer</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Comments</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.length > 0 ? (
              submissions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.consultant_name}</TableCell>
                  <TableCell>{s.skill_name}</TableCell>
                  <TableCell>{s.vendor_name}</TableCell>
                  <TableCell>{s.prime_vendor_name || "—"}</TableCell>
                  <TableCell>{s.end_client_name}</TableCell>
                  <TableCell>{s.marketer_name}</TableCell>
                  <TableCell>{s.vendor_response}</TableCell>
                  <TableCell>{s.comments}</TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      onClick={() => {
                        setSelected(s);
                        setOpenDetails(true);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  No submissions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AddSubmissionModal open={openAdd} onClose={() => { setOpenAdd(false); fetchSubmissions(); }} />
      <SubmissionDetailsModal open={openDetails} onClose={() => setOpenDetails(false)} data={selected} />
    </Box>
  );
}
