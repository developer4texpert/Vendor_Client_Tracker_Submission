// src/components/Dashboard.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Popover,
  Divider,
  Chip,
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


const drawerWidth = 200;

/* ===== Compact tuning ===== */
const PAD = 1;               // card padding
const GAP = 1;               // grid gap (theme spacing)
const CHART_H = 220;         // compact chart height
const TITLE_MB = 0.5;

/* Stable width hook: ignores micro changes to prevent pie jitter */
function useElementWidth() {
  const ref = useRef(null);
  const last = useRef(0);
  const [w, setW] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    let raf = 0;
    const ro = new ResizeObserver(([entry]) => {
      const raw =
        entry.contentBoxSize &&
        (Array.isArray(entry.contentBoxSize)
          ? entry.contentBoxSize[0]?.inlineSize
          : entry.contentBoxSize.inlineSize);
      const next = Math.round(raw ?? el.clientWidth);
      if (Math.abs(next - last.current) < 4) return; // ignore micro-jitter
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        last.current = next;
        setW(next);
      });
    });
    ro.observe(el);
    last.current = el.clientWidth;
    setW(el.clientWidth);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);
  return [ref, w];
}

const Card = ({ children, sx }) => (
  <Box
    sx={{
      p: PAD,
      borderRadius: 2,
      bgcolor: "#fff",
      border: "1px solid #e5e7eb",
      boxShadow: "0 1px 2px rgba(16,24,40,0.04)",
      ...sx,
    }}
  >
    {children}
  </Box>
);

const KPI = ({ label, value, color }) => (
  <Box
    sx={{
      p: 0.75,
      borderRadius: 1.5,
      bgcolor: "#fff",
      border: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      gap: 1,
      minWidth: 150,
      justifyContent: "space-between",
    }}
  >
    <Typography variant="subtitle1" sx={{ fontWeight: 800, color, lineHeight: 1 }}>
      {value}
    </Typography>
    <Typography variant="caption" sx={{ color: "#475467", fontWeight: 700 }}>
      {label}
    </Typography>
  </Box>
);

const drawerItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  { text: "Clients", icon: <BusinessIcon />, path: "/dashboard/clients" },
  { text: "Vendors", icon: <StorefrontIcon />, path: "/dashboard/vendors" },

  // 🔹 New Sales Section
  {
    text: "Sales",
    icon: <GroupsIcon />,
    children: [
      { text: "Consultants", path: "/dashboard/sales/consultants" },
      { text: "Submissions", path: "/dashboard/sales/submissions" },
      { text: "Interviews", path: "/dashboard/sales/interviews" },
    ],
  },

  { text: "History", icon: <HistoryIcon />, path: "/dashboard/history" },
];


export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const isRootDashboard = location.pathname === "/dashboard";

  /* Data */
  const [stats, setStats] = useState(null);
  const [recentClients, setRecentClients] = useState([]);
  const [vendorStats, setVendorStats] = useState(null);

    // === State for hover submenu ===
  const [openMenu, setOpenMenu] = useState(null);
  const handleMenuOpen = (text, anchor) => setOpenMenu({ text, anchor });
  const handleMenuClose = () => setOpenMenu(null);

  /* Responsive widths for each chart tile */
  const [clientBarRef, clientBarW] = useElementWidth();
  const [vendorBarRef, vendorBarW] = useElementWidth();
  const [clientPieRef, clientPieW] = useElementWidth();
  const [vendorPieRef, vendorPieW] = useElementWidth();

  useEffect(() => {
    const authHeader = {
      headers: { Authorization: `Bearer ${localStorage.getItem("access")}` },
    };
    (async () => {
      try {
        const [cStats, cList, vStats] = await Promise.all([
          coreApi.get("client/ClientStats/", authHeader),
          coreApi.get("client/GetClient/", authHeader),
          coreApi.get("vendor/VendorStats/", authHeader),
        ]);
        setStats(cStats.data);
        if (Array.isArray(cList.data)) {
          const sorted = [...cList.data].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
          setRecentClients(sorted.slice(0, 5)); // show more, still compact
        }
        setVendorStats(vStats.data?.summary || null);
      } catch {}
    })();
  }, []);

  /* Figures */
  const clientPie = useMemo(
    () =>
      stats
        ? [
            { id: 0, value: +stats.clients_with_vendors || 0, label: "With Vendors" },
            { id: 1, value: +stats.clients_without_vendors || 0, label: "Without Vendors" },
          ]
        : [],
    [stats]
  );

  const vendorPie = useMemo(
    () =>
      vendorStats
        ? [
            { id: 0, value: +vendorStats.active_vendors || 0, label: "Active" },
            { id: 1, value: +vendorStats.inactive_vendors || 0, label: "Inactive" },
          ]
        : [],
    [vendorStats]
  );

  /* Example mini time series (replace with API if you have it) */
  const clientsMonthlyBar = useMemo(
    () => [
      { m: "Jan", v: 12 },
      { m: "Feb", v: 19 },
      { m: "Mar", v: 7 },
      { m: "Apr", v: 15 },
      { m: "May", v: 11 },
      { m: "Jun", v: 18 },
    ],
    []
  );
  const vendorsMonthlyBar = useMemo(
    () => [
      { m: "Jan", v: 6 },
      { m: "Feb", v: 4 },
      { m: "Mar", v: 7 },
      { m: "Apr", v: 3 },
      { m: "May", v: 8 },
      { m: "Jun", v: 5 },
    ],
    []
  );

  const perf =
    stats && stats.total_clients
      ? `${(
          (+stats.clients_with_vendors / (+stats.total_clients || 1)) *
          100
        ).toFixed(1)}%`
      : "--";

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/");
  };

  /* Common pie props: lock legend to bottom to avoid layout shifts */
  const pieCommon = {
    height: CHART_H,
    margin: { top: 6, right: 6, bottom: 6, left: 6 },
    slotProps: {
      legend: {
        position: { vertical: "bottom", horizontal: "middle" },
        direction: "row",
      },
    },
    // animation: false, // uncomment if your @mui/x-charts supports it
  };

  return (
    <Box sx={{ display: "flex", bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      {/* Sidebar (compact) */}
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
        <Box sx={{ p: 1.25 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.2, lineHeight: 1 }}>
            VC Tracker
          </Typography>
        </Box>
        <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />
        <List dense sx={{ py: 0 }}>
  {drawerItems.map((item) => {
    if (item.children) {
      return (
        <Box
  key={item.text}
  onMouseEnter={(e) => handleMenuOpen(item.text, e.currentTarget)}
  onMouseLeave={handleMenuClose} // 👈 closes immediately when mouse leaves both button & popover
>
  {/* Main Sales Button */}
  <ListItemButton
    sx={{
      borderRadius: 1,
      mx: 0.5,
      my: 0.25,
      minHeight: 36,
      "&:hover": { background: "rgba(255,255,255,0.22)" },
    }}
  >
    <ListItemIcon sx={{ color: "#fff", minWidth: 30 }}>{item.icon}</ListItemIcon>
    <ListItemText
      primaryTypographyProps={{ variant: "body2", fontWeight: 700 }}
      primary={item.text}
    />
  </ListItemButton>

  {/* Hover Popup */}
  <Popover
    open={openMenu?.text === item.text}
    anchorEl={openMenu?.anchor}
    onClose={handleMenuClose}
    disableRestoreFocus
    anchorOrigin={{ vertical: "top", horizontal: "right" }}
    transformOrigin={{ vertical: "top", horizontal: "left" }}
    PaperProps={{
      onMouseEnter: () => {}, // no delay needed
      onMouseLeave: handleMenuClose, // 👈 close immediately when leaving submenu
      sx: {
        background: "#0ea5e9",
        color: "#fff",
        mt: "2px",
        borderRadius: 1.5,
        minWidth: 160,
      },
    }}
  >
    {item.children.map((sub) => (
      <ListItemButton
        key={sub.text}
        component={NavLink}
        to={sub.path}
        onClick={handleMenuClose}
        sx={{
          "&.active": { background: "rgba(255,255,255,0.22)" },
          "&:hover": { background: "rgba(255,255,255,0.2)" },
          color: "#fff",
          py: 0.8,
        }}
      >
        <ListItemText
          primaryTypographyProps={{ variant: "body2" }}
          primary={sub.text}
        />
      </ListItemButton>
    ))}
  </Popover>
</Box>

      );
    }

    // ✅ Regular menu items (Dashboard, Clients, Vendors, History)
    return (
      <ListItemButton
        key={item.text}
        component={NavLink}
        to={item.path}
        sx={{
          borderRadius: 1,
          mx: 0.5,
          my: 0.25,
          minHeight: 36,
          "&.active": { background: "rgba(255,255,255,0.22)" },
        }}
      >
        <ListItemIcon sx={{ color: "#fff", minWidth: 30 }}>{item.icon}</ListItemIcon>
        <ListItemText primaryTypographyProps={{ variant: "body2" }} primary={item.text} />
      </ListItemButton>
    );
  })}
</List>



        <Box sx={{ flexGrow: 1 }} />
        <List dense sx={{ py: 0 }}>
          <ListItemButton onClick={handleLogout} sx={{ mx: 0.5, mb: 1, borderRadius: 1, minHeight: 36 }}>
            <ListItemIcon sx={{ color: "#fff", minWidth: 30 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ variant: "body2" }} primary="Logout" />
          </ListItemButton>
        </List>
      </Drawer>

      {/* Main */}
      <Box sx={{ flexGrow: 1, px: 2, py: 1 }}>
        {isRootDashboard ? (
          <>
            {/* Header + compact KPIs row */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>
                Dashboard
              </Typography>
              <Chip label="Live" size="small" color="success" />
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0,1fr))",
                  md: "repeat(4, minmax(0,1fr))",
                },
                gap: GAP,
                mb: 1,
              }}
            >
              <KPI label="Total Clients" value={stats?.total_clients ?? "--"} color="#1d4ed8" />
              <KPI label="With Vendors" value={stats?.clients_with_vendors ?? "--"} color="#16a34a" />
              <KPI label="Without Vendors" value={stats?.clients_without_vendors ?? "--"} color="#dc2626" />
              <KPI label="Performance" value={perf} color="#0891b2" />
            </Box>

            {/* ===== NEW TILE LAYOUT (no gaps) ===== */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  lg: "1.2fr 1fr", // wider left column for both bar charts
                },
                gap: GAP,
                alignItems: "stretch",
              }}
            >
              {/* LEFT COLUMN: stack both bar charts */}
              <Box sx={{ display: "grid", gap: GAP }}>
                <Card>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: TITLE_MB }}>
                    Clients Added (Month-wise)
                  </Typography>
                  <Box ref={clientBarRef}>
                    {clientBarW > 0 && (
                      <BarChart
                        width={clientBarW}
                        height={CHART_H}
                        xAxis={[{ scaleType: "band", data: clientsMonthlyBar.map((d) => d.m) }]}
                        series={[{ data: clientsMonthlyBar.map((d) => d.v) }]}
                      />
                    )}
                  </Box>
                </Card>

                <Card>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: TITLE_MB }}>
                    Vendors Added (Month-wise)
                  </Typography>
                  <Box ref={vendorBarRef}>
                    {vendorBarW > 0 && (
                      <BarChart
                        width={vendorBarW}
                        height={CHART_H}
                        xAxis={[{ scaleType: "band", data: vendorsMonthlyBar.map((d) => d.m) }]}
                        series={[{ data: vendorsMonthlyBar.map((d) => d.v) }]}
                      />
                    )}
                  </Box>
                </Card>
              </Box>

              {/* RIGHT COLUMN: client pie → vendor pie → recent list */}
              <Box
                sx={{
                  display: "grid",
                  gap: GAP,
                  gridAutoRows: "min-content",
                }}
              >
                <Card>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: TITLE_MB }}>
                    Client Statistics
                  </Typography>
                  <Box ref={clientPieRef}>
                    <PieChart
                      width={clientPieW || 360}
                      series={[{ data: clientPie }]}
                      {...pieCommon}
                    />
                  </Box>
                </Card>

                <Card>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: TITLE_MB }}>
                    Vendor Status Split
                  </Typography>
                  <Box ref={vendorPieRef}>
                    <PieChart
                      width={vendorPieW || 360}
                      series={[{ data: vendorPie }]}
                      {...pieCommon}
                    />
                  </Box>
                </Card>

                <Card>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: TITLE_MB }}>
                    Recently Added Clients
                  </Typography>
                  {recentClients.length ? (
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                      {recentClients.map((c) => (
                        <li key={c.id}>
                          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
                            {c.name}
                          </Typography>
                        </li>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No recent clients
                    </Typography>
                  )}
                </Card>
              </Box>
            </Box>
          </>
        ) : (
          <Outlet />
        )}
      </Box>
    </Box>
  );
}
