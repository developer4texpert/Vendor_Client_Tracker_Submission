// src/components/Dashboard.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Grid,
  Divider,
} from "@mui/material";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import BusinessIcon from "@mui/icons-material/Business";
import StorefrontIcon from "@mui/icons-material/Storefront";
import GroupsIcon from "@mui/icons-material/Groups";
import HistoryIcon from "@mui/icons-material/History";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import coreApi from "../api/core";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart } from "@mui/x-charts/BarChart";

const drawerWidth = 220;

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRootDashboard = location.pathname === "/dashboard";

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [recentClients, setRecentClients] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await coreApi.get("client/ClientStats/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("❌ Failed to load client stats", err);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchRecentClients = async () => {
  try {
    const res = await coreApi.get("client/GetClient/", {
      headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
    });

    if (Array.isArray(res.data)) {
      // sort newest first by created_at or id
      const sorted = [...res.data].sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setRecentClients(sorted.slice(0, 3)); // ✅ always latest 3
    }
  } catch (err) {
    console.error("❌ Failed to load recent clients", err);
  }
};


    fetchStats();
    fetchRecentClients();
    const listener = () => fetchRecentClients();
  window.addEventListener("clientAdded", listener);

  return () => window.removeEventListener("clientAdded", listener);
  }, []);

  const chartData = stats
    ? [
        { id: 0, value: stats.clients_with_vendors, label: "With Vendors" },
        { id: 1, value: stats.clients_without_vendors, label: "Without Vendors" },
      ]
    : [];

  const barData = [
    { month: "Jan", clients: 12 },
    { month: "Feb", clients: 19 },
    { month: "Mar", clients: 7 },
    { month: "Apr", clients: 15 },
  ];

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/");
  };

  return (
    <Box sx={{ display: "flex", bgcolor: "#f8fafc", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            background: "linear-gradient(180deg,#0ea5e9,#06b6d4)",
            color: "#fff",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            VC Tracker
          </Typography>
        </Box>
        <Divider sx={{ bgcolor: "rgba(255,255,255,0.3)" }} />

        <List>
          {[
            { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
            { text: "Clients", icon: <BusinessIcon />, path: "/dashboard/clients" },
            { text: "Vendors", icon: <StorefrontIcon />, path: "/dashboard/vendors" },
            { text: "Consultants", icon: <GroupsIcon />, path: "/dashboard/consultants" },
            { text: "History", icon: <HistoryIcon />, path: "/dashboard/history" },
          ].map((item) => (
            <ListItem
              button
              key={item.text}
              component={NavLink}
              to={item.path}
              style={({ isActive }) => ({
                background: isActive ? "rgba(255,255,255,0.2)" : "transparent",
              })}
            >
              <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>

        <Box sx={{ flexGrow: 1 }} />
        <List>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon sx={{ color: "#fff" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, p: 4 }}>
        {isRootDashboard ? (
          <>
            {/* Row 1: Info Cards */}
            <Grid container spacing={3}>
              {[
                {
                  label: "Total Clients",
                  value: stats ? stats.total_clients : "--",
                  color: "#1d4ed8",
                  change: "+5% since yesterday",
                },
                {
                  label: "With Vendors",
                  value: stats ? stats.clients_with_vendors : "--",
                  color: "#16a34a",
                  change: "+2% since last week",
                },
                {
                  label: "Without Vendors",
                  value: stats ? stats.clients_without_vendors : "--",
                  color: "#dc2626",
                  change: "-1% since last week",
                },
                {
                  label: "Performance",
                  value: stats
                    ? `${(
                        (stats.clients_with_vendors /
                          (stats.total_clients || 1)) *
                        100
                      ).toFixed(2)}%`
                    : "--",
                  color: "#0891b2",
                  change: "+3% since last month",
                },
              ].map((card, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: "#fff",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: card.color }}
                    >
                      {card.value}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {card.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ display: "block", color: "gray", mt: 0.5 }}
                    >
                      {card.change}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Row 2: Charts */}
            <Grid container spacing={3} sx={{ mt: 3 }}>
              <Grid item xs={12} md={7}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, fontWeight: 600 }}
                >
                  Clients Growth
                </Typography>
                <BarChart
                  xAxis={[{ scaleType: "band", data: barData.map((d) => d.month) }]}
                  series={[{ data: barData.map((d) => d.clients) }]}
                  height={300}
                />
              </Grid>
              <Grid item xs={12} md={5}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, fontWeight: 600 }}
                >
                  Client Statistics
                </Typography>
                {loadingStats ? (
                  <Typography>Loading...</Typography>
                ) : (
                  <PieChart series={[{ data: chartData }]} height={300} />
                )}
              </Grid>
            </Grid>

            {/* Row 3: Lists */}
            <Grid container spacing={3} sx={{ mt: 3 }}>
              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, fontWeight: 600 }}
                >
                  Recently Added Clients
                </Typography>
                {recentClients.length === 0 ? (
                  <Typography>No recent clients</Typography>
                ) : (
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {recentClients.map((c) => (
                      <li key={c.id}>
                        <Typography variant="body2">{c.name}</Typography>
                      </li>
                    ))}
                  </ul>
                )}
              </Grid>

              {/* Reserved for Vendor Stats */}
              <Grid item xs={12} md={6}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, fontWeight: 600 }}
                >
                  Vendor Statistics (Coming Soon)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Placeholder for vendor metrics.
                </Typography>
              </Grid>
            </Grid>
          </>
        ) : (
          <Outlet />
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;
