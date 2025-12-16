import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import pinIcon from "./assets/pin.png";

// --- Material UI Imports ---
import {
  AppBar,
  Toolbar,
  Button,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  IconButton,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Stack,
  Link,
  useMediaQuery,
  Typography
} from "@mui/material";

// --- Icons ---
import BoltIcon from "@mui/icons-material/Bolt";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import AssessmentIcon from "@mui/icons-material/Assessment"; 
import SettingsInputComponentIcon from "@mui/icons-material/SettingsInputComponent";
import CableIcon from "@mui/icons-material/Cable"; 
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import FactoryIcon from "@mui/icons-material/Factory";
import SolarPowerIcon from "@mui/icons-material/SolarPower";
import SpeedIcon from "@mui/icons-material/Speed"; 
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import DescriptionIcon from "@mui/icons-material/Description";
import SavingsIcon from "@mui/icons-material/Savings";
import SecurityIcon from "@mui/icons-material/Security";
import TimerIcon from "@mui/icons-material/Timer";
import GavelIcon from "@mui/icons-material/Gavel";
import InsightsIcon from "@mui/icons-material/Insights";
import MemoryIcon from "@mui/icons-material/Memory";

// --- Assets ---
import videoBackground from "./assets/Video Project.mp4";
import logoImage from "./assets/iot.png";
import './pages/welcome.css';

// --- Custom Dark Theme Definition ---
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#00d4ff", // Cyan
    },
    secondary: {
      main: "#00ff9d", // Neon Green
    },
    background: {
      default: "#0f172a", // Deep Dark Blue
      paper: "rgba(30, 41, 59, 0.4)", // HIGHLY TRANSPARENT FOR GLASS EFFECT
    },
    text: {
      primary: "#f8fafc",
      secondary: "#cbd5e1",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h1: { 
      fontFamily: "'Outfit', sans-serif", 
      fontWeight: 800, 
      fontSize: "3.5rem", 
      "@media (min-width:900px)": { fontSize: "5.5rem" } 
    },
    h2: { fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "3.5rem" },
    h3: { fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "2.8rem" },
    h4: { fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: "2rem" },
    h5: { fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: "1.5rem" },
    body1: { fontSize: "1.1rem", lineHeight: 1.7 },
    button: { fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: "1.1rem", textTransform: "none" },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          backgroundColor: "rgba(30, 41, 59, 0.4)", // Glass Style
          backdropFilter: "blur(20px)",            
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
          transition: "transform 0.3s ease, border-color 0.3s ease",
          "&:hover": {
            transform: "translateY(-10px)",
            borderColor: "#00d4ff",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 50, padding: "12px 40px" },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(15, 23, 42, 0.6)", 
          backdropFilter: "blur(15px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }
      }
    }
  },
});

export default function Welcome() {
  const navigate = useNavigate();
  const isMobile = useMediaQuery(darkTheme.breakpoints.down("md"));
  const mapRef = useRef(null);

  // State for Modals
  const [openSolution, setOpenSolution] = useState(false);
  const [openDemo, setOpenDemo] = useState(false);
  const [openLogin, setOpenLogin] = useState(false);
  const [loginTab, setLoginTab] = useState("customer");
  
  // State for EMS selection logic in Solution Modal
  const [emsSelected, setEmsSelected] = useState(false);

  // --- STATE FOR "TAILOR YOUR SOLUTION" FORM ---
  const [solutionFormData, setSolutionFormData] = useState({
    fullName: "",
    mobileNumber: "",
    email: "",
    plantType: "",
    plantAddress: "", // Added as per API req
    systemRequirement: [] // API expects array
  });

  // --- STATE FOR "REQUEST IT CALLBACK" FORM ---
  const [callbackFormData, setCallbackFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    message: "",
    requestCallback: true
  });

  // --- HANDLERS FOR SOLUTION FORM ---
  const handleSolutionChange = (e) => {
    setSolutionFormData({ ...solutionFormData, [e.target.name]: e.target.value });
  };

  const handleSolutionCheckbox = (e) => {
    const { value, checked } = e.target;
    const { systemRequirement } = solutionFormData;
    
    if (checked) {
      setSolutionFormData({ ...solutionFormData, systemRequirement: [...systemRequirement, value] });
    } else {
      setSolutionFormData({ ...solutionFormData, systemRequirement: systemRequirement.filter((item) => item !== value) });
    }
  };

  // --- HANDLERS FOR CALLBACK FORM ---
  const handleCallbackChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCallbackFormData({
      ...callbackFormData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // --- SUBMIT: TAILOR YOUR SOLUTION (API 1) ---
  const submitSolution = async () => {
    // Basic Validation
    if (!solutionFormData.fullName || !solutionFormData.mobileNumber || !solutionFormData.email) {
      alert("Please fill in all required fields.");
      return;
    }

    // Format payload to match API requirements
    const payload = {
      fullName: solutionFormData.fullName,
      mobileNumber: solutionFormData.mobileNumber,
      email: solutionFormData.email,
      // API expects array for plantType, UI is single select. Wrapping in array.
      plantType: solutionFormData.plantType ? [solutionFormData.plantType] : [], 
      plantAddress: solutionFormData.plantAddress,
      systemRequirement: solutionFormData.systemRequirement
    };

    try {
      const response = await fetch('https://bcrm.ipqspl.com/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Check if response is ok (200-299)
      if (response.ok) {
        const result = await response.json(); 
        // Some APIs return 200 even on logical error, check result if needed.
        // Assuming strictly restful success here or checking result content:
        console.log("Solution Success:", result);
        alert("Quote Request Sent Successfully!");
        setOpenSolution(false); 
        // Reset form
        setSolutionFormData({
          fullName: "",
          mobileNumber: "",
          email: "",
          plantType: "",
          plantAddress: "",
          systemRequirement: []
        });
        setEmsSelected(false);
      } else {
        console.error("Server Error:", response.statusText);
        alert("Failed to send quote. Please try again.");
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Error connecting to server. Check internet connection.");
    }
  };

  // --- SUBMIT: REQUEST CALLBACK (API 2) ---
  const submitCallback = async () => {
    // Basic Validation
    if (!callbackFormData.phoneNumber || !callbackFormData.email) {
      alert("Please fill in required fields.");
      return;
    }

    try {
      const response = await fetch('https://bcrm.ipqspl.com/api/oms-callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callbackFormData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Callback Success:", result);
        alert("Callback Request Sent Successfully!");
        setOpenDemo(false);
        // Reset form
        setCallbackFormData({
          fullName: "",
          phoneNumber: "",
          email: "",
          message: "",
          requestCallback: true
        });
      } else {
        console.error("Server Error:", response.statusText);
        alert("Failed to send callback request. Please try again.");
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Error connecting to server.");
    }
  };

  // --- Map Initialization ---
  useEffect(() => {
    const container = L.DomUtil.get("clientMap");
    if (!container) return;

    if (mapRef.current) return;

    const map = L.map("clientMap", {
      center: [20.5937, 78.9629],
      zoom: 5,
      zoomControl: true,
      scrollWheelZoom: true
    });

    mapRef.current = map;

    L.tileLayer("https://tile.openstreetmap.de/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors"
    }).addTo(map);

    const customIcon = L.icon({
      iconUrl: pinIcon,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });

    const locations = [
      { name: "Tata Power", city: "Mumbai", coords: [19.076, 72.877] },
      { name: "MIDC Industrial", city: "Pune", coords: [18.5204, 73.8567] },
      { name: "MSEDCL", city: "Nagpur", coords: [21.1458, 79.0882] },
      { name: "L&T Heavy Engg.", city: "Nashik", coords: [19.9975, 73.7898] },
      { name: "Reliance Infra", city: "Surat", coords: [21.1702, 72.8311] },
      { name: "Essar Steel", city: "Hazira", coords: [21.1167, 72.7167] }
    ];

    const bounds = [];

    locations.forEach((loc) => {
      L.marker(loc.coords, { icon: customIcon })
        .addTo(map)
        .bindPopup(`<b>${loc.name}</b><br>${loc.city}`);

      bounds.push(loc.coords);
    });

    map.fitBounds(bounds, { padding: [50, 50] });

    setTimeout(() => map.invalidateSize(), 500);

    return () => {
      if (mapRef.current) {
        mapRef.current.off();
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      
      {/* 1. NAVBAR */}
      <AppBar position="fixed" elevation={0}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: "space-between", height: 90 }}>
            <Box sx={{ display: "flex", alignItems: "center", color: "primary.main", fontWeight: 800, fontSize: "1.8rem", letterSpacing: 1 }}>
              <img src={logoImage} alt="Logo" style={{ height: 45, marginRight: 15 }} />
              IPQS OMS
            </Box>

            {!isMobile && (
              <Stack direction="row" spacing={6}>
                {["Home", "Features", "Applications", "Benefits", "Network", "Contact"].map((item) => (
                  <Link href={`#${item.toLowerCase().replace(' ', '-')}`} key={item} underline="none" color="text.primary" sx={{ "&:hover": { color: "primary.main" }, fontWeight: 500, fontSize: "1.1rem", transition: "0.2s" }}>
                    {item}
                  </Link>
                ))}
              </Stack>
            )}

            <Button 
              variant="outlined" 
              color="primary" 
              startIcon={<PersonIcon />}
              onClick={() => navigate('./login')}
              sx={{ borderWidth: 2, fontSize: "1rem", '&:hover': { borderWidth: 2 } }}
            >
              Login
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      {/* 2. HERO SECTION */}
      <Box id="home" sx={{ position: "relative", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <video autoPlay muted loop playsInline className="video-bg">
          <source src={videoBackground} type="video/mp4" />
        </video>
        <Box className="hero-overlay" />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2, textAlign: "center", pt: 8 }}>
          <Box sx={{
             bgcolor: "rgba(0, 0, 0, 0.4)", 
             backdropFilter: "blur(8px)",   
             borderRadius: 8,
             border: "1px solid rgba(255,255,255,0.08)",
             p: { xs: 4, md: 8 },           
             display: "inline-block",       
             maxWidth: "1100px"
          }}>
            <Typography variant="overline" color="secondary" sx={{ letterSpacing: 6, fontSize: "1.1rem", fontWeight: 700, mb: 2, display: "block" }}>
              MONITOR | ANALYZE | OPTIMIZE
            </Typography>
            <Typography variant="h1" sx={{ mb: 4, lineHeight: 1.1 }}>
              One Platform. Any Equipment. <br />
              <span style={{ color: "#00d4ff" }}>Total Control.</span>
            </Typography>
            <Typography variant="h5" color="text.secondary" sx={{ mb: 6, maxWidth: "800px", mx: "auto", fontWeight: 400, lineHeight: 1.6 }}>
              Modern industries depend on accurate and uninterrupted power performance. 
              IPQS brings real-time visibility and AI-driven insights to your electrical infrastructure.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={4} justifyContent="center">
              <Button variant="contained" size="large" startIcon={<BoltIcon />} onClick={() => setOpenSolution(true)} sx={{ fontSize: "1.2rem", px: 5 }}>
                Explore Solutions
              </Button>
              <Button variant="outlined" color="inherit" size="large" startIcon={<PlayArrowIcon />} onClick={() => setOpenDemo(true)} sx={{ fontSize: "1.2rem", px: 5, borderWidth: 2, '&:hover': { borderWidth: 2 } }}>
                Request Demo
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
      
      {/* 3. FEATURES SECTION */}
      <Box id="features" style={{ padding: "120px 0", background: "#0f172a" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <Typography variant="h3" gutterBottom>
              Key <span style={{ color: "#00d4ff" }}>Features</span>
            </Typography>
            <Typography variant="h5" color="text.secondary" fontWeight={400}>
              One Dashboard for All Your Electrical Assets
            </Typography>
          </div>
          <div className="row gy-4">
            <div className="col-12 col-md-6 col-lg-3">
              <Box sx={{ height: "100%", borderRadius: "26px", p: 5, textAlign: "left", background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", transition: "0.3s ease", "&:hover": { transform: "translateY(-6px)", borderColor: "#00d4ff" } }}>
                <Box sx={{ color: "#00d4ff", mb: 3 }}><AssessmentIcon sx={{ fontSize: 60 }} /></Box>
                <Typography variant="h5" fontWeight="700" gutterBottom sx={{ mb: 2 }}>AI-Based Reporting</Typography>
                <Typography variant="body1" color="text.secondary">Generate smart, automated reports powered by AI for your ease. Get deep insights without manual calculations.</Typography>
              </Box>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <Box sx={{ height: "100%", borderRadius: "26px", p: 5, textAlign: "left", background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", transition: "0.3s ease", "&:hover": { transform: "translateY(-6px)", borderColor: "#00d4ff" } }}>
                <Box sx={{ color: "#00d4ff", mb: 3 }}><SettingsInputComponentIcon sx={{ fontSize: 60 }} /></Box>
                <Typography variant="h5" fontWeight="700" gutterBottom sx={{ mb: 2 }}>One System for All</Typography>
                <Typography variant="body1" color="text.secondary">Works with LT/HT panels, APFC, MCC/PCC, solar inverters, and DG sets—all in one dashboard.</Typography>
              </Box>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <Box sx={{ height: "100%", borderRadius: "26px", p: 5, textAlign: "left", background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", transition: "0.3s ease", "&:hover": { transform: "translateY(-6px)", borderColor: "#00d4ff" } }}>
                <Box sx={{ color: "#00d4ff", mb: 3 }}><CableIcon sx={{ fontSize: 60 }} /></Box>
                <Typography variant="h5" fontWeight="700" gutterBottom sx={{ mb: 2 }}>Plug & Play RS485</Typography>
                <Typography variant="body1" color="text.secondary">Connects to any meter or controller supporting Modbus RS485 without complex wiring.</Typography>
              </Box>
            </div>
            <div className="col-12 col-md-6 col-lg-3">
              <Box sx={{ height: "100%", borderRadius: "26px", p: 5, textAlign: "left", background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", transition: "0.3s ease", "&:hover": { transform: "translateY(-6px)", borderColor: "#00d4ff" } }}>
                <Box sx={{ color: "#00d4ff", mb: 3 }}><PhoneIphoneIcon sx={{ fontSize: 60 }} /></Box>
                <Typography variant="h5" fontWeight="700" gutterBottom sx={{ mb: 2 }}>Anytime Access</Typography>
                <Typography variant="body1" color="text.secondary">Monitor your entire plant from mobile, tablet, or PC from anywhere in the world.</Typography>
              </Box>
            </div>
          </div>
        </div>
      </Box>

      {/* 4. APPLICATIONS SECTION */}
      <Box id="applications" sx={{ py: 15, bgcolor: "#0b1120" }}>
        <Container maxWidth="xl">
          <Box textAlign="center" mb={10}>
            <Typography variant="h3" gutterBottom>Industrial <span style={{ color: "#00d4ff" }}>Applications</span></Typography>
            <Typography variant="h5" color="text.secondary" fontWeight={400}>Tailored Monitoring for Every Sector</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 4, overflowX: "auto", pb: 4, px: 2, scrollBehavior: "smooth", scrollbarWidth: "thin", "&::-webkit-scrollbar": { height: "10px" }, "&::-webkit-scrollbar-track": { background: "rgba(255,255,255,0.02)", borderRadius: "10px" }, "&::-webkit-scrollbar-thumb": { background: "rgba(0, 212, 255, 0.3)", borderRadius: "10px", "&:hover": { background: "#00d4ff" } } }}>
            {[
              { img: "https://plus.unsplash.com/premium_photo-1663100602567-f5aa2ef49375?q=80&w=1155&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", title: "LT & HT Panels", icon: <FactoryIcon />, desc: "Monitor feeder load, voltages, and currents. Prevent breakdowns." },
              { img: "https://images.unsplash.com/photo-1558054665-fbe00cd7d920?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", title: "Power Factor (APFC)", icon: <BoltIcon />, desc: "Optimize PF for APFC panels. Track capacitor health and reduce penalties." },
              { img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158", title: "Distribution Panels", icon: <CableIcon />, desc: "Track consumption of individual machines. Detect overload instantly." },
              { img: "https://images.unsplash.com/photo-1509391366360-2e959784a276", title: "Solar Monitoring", icon: <SolarPowerIcon />, desc: "Track solar generation, Performance Ratio (PR), inverter faults." },
              { img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71", title: "Centralized EMS", icon: <SpeedIcon />, desc: "Energy Management System for multiple panels. Reduces manual errors." }
            ].map((app, index) => (
              <Box key={index} sx={{ minWidth: { xs: "300px", md: "420px" }, flex: "0 0 auto" }}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardMedia component="img" height="260" image={`${app.img}?auto=format&fit=crop&w=800`} alt={app.title} sx={{ filter: "brightness(0.85)" }} />
                  <CardContent sx={{ flexGrow: 1, p: 4 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2} color="primary.main">
                      {app.icon}
                      <Typography variant="h5" color="text.primary">{app.title}</Typography>
                    </Box>
                    <Typography variant="body1" color="text.secondary">{app.desc}</Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* 5. BENEFITS SECTION */}
      <Box id="benefits" sx={{ py: 15, bgcolor: "background.default" }}>
        <div className="container">
          <Box textAlign="center" mb={10}>
            <Typography variant="h3" gutterBottom>Business <span style={{ color: "#00d4ff" }}>Benefits</span></Typography>
            <Typography variant="h5" color="text.secondary" fontWeight={400}>Why Industry Leaders Choose IPQS</Typography>
          </Box>
          <div className="row gy-4">
            {[
              { icon: <DescriptionIcon />, title: "AI Reports", text: "Automated AI reports" },
              { icon: <SavingsIcon />, title: "Reduce Bills", text: "PF improvement savings" },
              { icon: <SecurityIcon />, title: "Plant Safety", text: "Minimize fire risks" },
              { icon: <TimerIcon />, title: "No Downtime", text: "Predictive alerts" },
              { icon: <GavelIcon />, title: "Avoid Penalties", text: "Maintain optimal PF" },
              { icon: <InsightsIcon />, title: "Data Decisions", text: "Analytics over guess" }
            ].map((b, i) => (
              <div className="col-12 col-sm-6 col-md-4 col-lg-2" key={i}>
                <Card sx={{ height: "100%", textAlign: "center", py: 3, px: 1, background: "rgba(30, 41, 59, 0.4)", borderRadius: "20px", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", transition: "0.3s ease", "&:hover": { transform: "translateY(-8px)", borderColor: "#00d4ff" } }}>
                  <CardContent>
                    <Box sx={{ color: "secondary.main", mb: 2, "& svg": { fontSize: 40 } }}>{b.icon}</Box>
                    <Typography variant="h6" gutterBottom>{b.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{b.text}</Typography>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </Box>

      {/* 6. NETWORK SECTION */}
      <Box id="network" style={{ padding: "120px 0", background: "#0b1120" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <Typography variant="h3" gutterBottom>Our <span style={{ color: "#00d4ff" }}>Network</span></Typography>
            <Typography variant="h5" color="text.secondary" fontWeight={400}>Trusted by major industrial players</Typography>
          </div>
          <div className="row">
            <div className="col-12 col-lg-8">
              <Box sx={{ height: 600, width: "100%", borderRadius: 5, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
                <div id="clientMap" style={{ height: "100%", width: "100%" }}></div>
              </Box>
            </div>
            <div className="col-12 col-lg-4">
              <Box sx={{ bgcolor: "background.paper", p: 5, borderRadius: 5, height: "100%", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}>
                <Typography variant="h4" color="primary" gutterBottom sx={{ borderBottom: "1px solid rgba(255,255,255,0.1)", pb: 2, mb: 4 }}>Active Sites</Typography>
                <Stack spacing={4}>
                  {[ 
                    { name: "Tata Power", loc: "Mumbai - Power Grid", color: "#00d4ff" },
                    { name: "MIDC Industrial", loc: "Pune - Load Dist.", color: "#22c55e" },
                    { name: "MSEDCL", loc: "Nagpur - Substation", color: "#a855f7" },
                    { name: "L&T Heavy Engg.", loc: "Nashik - Mfg Unit", color: "#f59e0b" },
                    { name: "Reliance Infra", loc: "Surat - Industrial Zone", color: "#00e1ff" },
                    { name: "Essar Steel", loc: "Hazira - Steel Plant", color: "#ff0099" },
                  ].map((site, i) => (
                    <Box key={i} display="flex" alignItems="flex-start" gap={2}>
                      <Box sx={{ width: 16, height: 16, borderRadius: "50%", bgcolor: site.color, boxShadow: `0 0 15px ${site.color}`, mt: 0.8 }} />
                      <Box>
                        <Typography variant="h6" lineHeight={1.2}>{site.name}</Typography>
                        <Typography variant="body1" color="text.secondary" mt={0.5}>{site.loc}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </div>
          </div>
        </div>
      </Box>

      {/* 7. FOOTER */}
      <Box id="contact-footer" sx={{ bgcolor: "#0f1115", py: 8, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} justifyContent="space-between">
            <Grid item xs={12} md={4}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                 <img src={logoImage} alt="Logo" style={{ height: 40 }} />
                 <Typography variant="h4" color="primary" fontWeight={800}>IPQS OMS</Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 350, lineHeight: 1.6 }}>
                Empowering Indian industries with indigenous, AI-driven IoT monitoring solutions for electrical infrastructure. 100% Made in India.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h5" color="white" gutterBottom mb={2}>Office Address</Typography>
              <Box display="flex" gap={2}>
                <LocationOnIcon color="primary" sx={{ mt: 0.5 }} />
                <Typography variant="body1" color="text.secondary">
                  209, Gangamai Industrial Complex,<br /> MIDC Ambad, Nashik 422010,<br /> Maharashtra, India
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h5" color="white" gutterBottom mb={2}>Get in Touch</Typography>
              <Stack spacing={2}>
                <Box display="flex" gap={2} alignItems="center">
                  <EmailIcon color="primary" />
                  <Typography variant="body1" color="text.secondary">sales2@ipqspl.com</Typography>
                </Box>
                <Box display="flex" gap={2} alignItems="center">
                  <PhoneIcon color="primary" />
                  <Typography variant="body1" color="text.secondary">+91 89565 35701</Typography>
                </Box>
                <Box display="flex" gap={2} alignItems="center">
                   <BusinessCenterIcon color="primary" />
                   <Typography variant="body1" color="text.secondary">Careers: customercare@ipqspl.com</Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
          <Box textAlign="center" mt={8} pt={4} borderTop="1px solid rgba(255,255,255,0.05)">
            <Typography variant="body2" color="text.secondary">&copy; 2025 IPQS OMS. All Rights Reserved.</Typography>
          </Box>
        </Container>
      </Box>

      {/* --- EXPLORE SOLUTIONS MODAL (API 1 Integrated) --- */}
      <Dialog open={openSolution} onClose={() => setOpenSolution(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: "#1e293b", backgroundImage: "none" } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5" fontWeight={700}>Tailor Your Solution</Typography>
          <IconButton onClick={() => setOpenSolution(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
           <Typography variant="body1" color="text.secondary" mb={3}>Complete your profile to get a custom quote.</Typography>
           <form>
             <TextField 
                fullWidth 
                label="Full Name" 
                name="fullName"
                value={solutionFormData.fullName}
                onChange={handleSolutionChange}
                variant="outlined" 
                margin="normal" 
             />
             <TextField 
                fullWidth 
                label="Phone Number" 
                name="mobileNumber" 
                value={solutionFormData.mobileNumber}
                onChange={handleSolutionChange}
                variant="outlined" 
                margin="normal" 
             />
             <TextField 
                fullWidth 
                label="Email Address" 
                name="email"
                value={solutionFormData.email}
                onChange={handleSolutionChange}
                variant="outlined" 
                margin="normal" 
             />
             {/* New Field: Plant Address */}
             <TextField 
                fullWidth 
                label="Plant Address" 
                name="plantAddress"
                value={solutionFormData.plantAddress}
                onChange={handleSolutionChange}
                variant="outlined" 
                margin="normal" 
             />
             
             <TextField 
               select 
               fullWidth 
               label="Plant Type" 
               name="plantType"
               value={solutionFormData.plantType}
               onChange={handleSolutionChange}
               variant="outlined" 
               margin="normal" 
               SelectProps={{
                 MenuProps: {
                   PaperProps: {
                     sx: {
                       bgcolor: "#1e293b",
                       backgroundImage: "none",
                       color: "#fff",
                       '& .MuiMenuItem-root': {
                         '&:hover': { bgcolor: "rgba(255, 255, 255, 0.08)" },
                         '&.Mui-selected': { bgcolor: "primary.main", color: "#0f172a", '&:hover': { bgcolor: "primary.dark" } },
                       },
                     },
                   },
                 },
               }}
             >
               <MenuItem value="Manufacturing">Manufacturing</MenuItem>
               <MenuItem value="Hospital">Hospital</MenuItem>
               <MenuItem value="Solar">Solar Plant</MenuItem>
               <MenuItem value="Stone Crusher">Stone Crusher</MenuItem>
               <MenuItem value="Chemical">Chemical</MenuItem>
               <MenuItem value="Food Processing">Food Processing</MenuItem>
               <MenuItem value="Steel Industry">Steel Industry</MenuItem>
               <MenuItem value="Other">Other</MenuItem>
             </TextField>
             
             <Typography variant="h6" color="primary" mt={3} mb={1}>Requirements</Typography>
             <Grid container>
               {["LT & HT Panels", "Solar Monitoring", "Distribution Panels", "DG Set"].map(item => (
                 <Grid item xs={6} key={item}>
                   <FormControlLabel 
                     control={
                        <Checkbox 
                           size="small" 
                           value={item}
                           checked={solutionFormData.systemRequirement.includes(item)}
                           onChange={handleSolutionCheckbox}
                        />
                     } 
                     label={<Typography variant="body1">{item}</Typography>} 
                   />
                 </Grid>
               ))}
               <Grid item xs={12}>
                  <FormControlLabel 
                    control={<Checkbox size="small" checked={emsSelected} onChange={(e) => setEmsSelected(e.target.checked)} />} 
                    label={<Typography variant="body1">EMS Monitoring</Typography>} 
                  />
               </Grid>
             </Grid>

             {emsSelected && (
               <TextField fullWidth label="Number of Meters" type="number" margin="normal" size="small" />
             )}

             <Button 
                fullWidth 
                variant="contained" 
                size="large" 
                onClick={submitSolution}
                sx={{ mt: 3, py: 1.5 }}
             >
                Request Quote
             </Button>
           </form>
        </DialogContent>
      </Dialog>

      {/* --- LOGIN MODAL (Unchanged) --- */}
      <Dialog open={openLogin} onClose={() => setOpenLogin(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: "#1e293b", backgroundImage: "none" } }}>
        <DialogContent sx={{ p: 4, textAlign: "center" }}>
            <Box mb={4}>
              <Typography variant="h4" fontWeight={700} gutterBottom>Welcome Back</Typography>
              <Typography variant="body1" color="text.secondary">Login to access your dashboard</Typography>
            </Box>
            
            <Box sx={{ bgcolor: "#0f172a", p: 0.5, borderRadius: 3, display: "flex", mb: 4 }}>
               <Button 
                 fullWidth 
                 variant={loginTab === "customer" ? "contained" : "text"} 
                 onClick={() => setLoginTab("customer")}
                 sx={{ borderRadius: 3, bgcolor: loginTab === "customer" ? "primary.main" : "transparent", color: loginTab === "customer" ? "#0f172a" : "text.secondary" }}
               >
                 Customer
               </Button>
               <Button 
                 fullWidth 
                 variant={loginTab === "company" ? "contained" : "text"} 
                 onClick={() => setLoginTab("company")}
                 sx={{ borderRadius: 3, bgcolor: loginTab === "company" ? "primary.main" : "transparent", color: loginTab === "company" ? "#0f172a" : "text.secondary" }}
               >
                 Company
               </Button>
            </Box>

            <form onSubmit={handleLoginSubmit}>
              <TextField fullWidth label="User ID / Email" variant="outlined" margin="normal" />
              <TextField fullWidth label="Password" type="password" variant="outlined" margin="normal" />
              <Button fullWidth variant="contained" size="large" type="submit" sx={{ mt: 3, py: 1.5 }}>Secure Login</Button>
            </form>
        </DialogContent>
      </Dialog>

      {/* --- REQUEST IT CALLBACK MODAL (API 2 Integrated) --- */}
      <Dialog open={openDemo} onClose={() => setOpenDemo(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: "#1e293b", backgroundImage: "none" } }}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          Request IT Callback
          <IconButton onClick={() => setOpenDemo(false)}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
           <Typography variant="body1" color="text.secondary" mb={2}>
              Get a detailed product explanation from our IT Team.
           </Typography>
           
           <TextField 
              fullWidth 
              label="Your Name" 
              name="fullName"
              value={callbackFormData.fullName}
              onChange={handleCallbackChange}
              margin="normal" 
           />
           <TextField 
              fullWidth 
              label="Phone Number" 
              name="phoneNumber"
              value={callbackFormData.phoneNumber}
              onChange={handleCallbackChange}
              margin="normal" 
              placeholder="+91"
           />
           <TextField 
              fullWidth 
              label="Email" 
              name="email"
              value={callbackFormData.email}
              onChange={handleCallbackChange}
              margin="normal" 
           />
           
           {/* New Field: Message Text Area */}
           <TextField
              fullWidth
              label="Message to Customer Care"
              name="message"
              value={callbackFormData.message}
              onChange={handleCallbackChange}
              multiline
              rows={3}
              margin="normal"
              placeholder="I would like to know more about..."
           />

           {/* New Field: Request Callback Checkbox */}
           <FormControlLabel
              control={
                <Checkbox 
                   checked={callbackFormData.requestCallback}
                   onChange={handleCallbackChange}
                   name="requestCallback"
                />
              }
              label="Request Callback from IT Team regarding product details."
              sx={{ mt: 1 }}
           />

           <Button 
              fullWidth 
              variant="contained" 
              size="large" 
              onClick={submitCallback}
              sx={{ mt: 3 }}
           >
              Submit Request
           </Button>
        </DialogContent>
      </Dialog>

    </ThemeProvider>
  );
}