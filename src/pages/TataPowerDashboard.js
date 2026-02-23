import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { 
  Box, Grid, Stack, Card, Typography, Table, TableBody, 
  TableCell, TableHead, TableRow, Tabs, Tab, Button, IconButton, 
  ThemeProvider, CssBaseline, createTheme, Menu, Divider, Select, MenuItem
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { 
  SignalCellularAlt, ElectricalServices, Speed, TrendingUp, 
  CallMade, BarChart, Download, Circle, Logout, KeyboardArrowDown
} from '@mui/icons-material';

// Import Logos (Ensure these paths match your project structure)
import ipqsLogo from '../assets/logo.png'; 
import tataLogo from '../assets/tata_power.png'; 

// ==========================================
// 1. SOCKET CONNECTION & UTILITIES
// ==========================================
const socket = io("https://ipqsoms.com", {
  path: "/socket.io",
  transports: ["websocket"],
});

// Helper functions for unit conversion
const formatVoltageToKV = (volts) => {
  if (volts === undefined || volts === null || isNaN(volts) || volts === '') return '--';
  return (parseFloat(volts) / 1000).toFixed(2);
};

const formatToMega = (val) => {
  if (val === undefined || val === null || isNaN(val) || val === '') return '--';
  return (parseFloat(val) / 1000).toFixed(2);
};

// ==========================================
// 2. THEME DEFINITION
// ==========================================
const theme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#0f172a', paper: '#1e293b' },
    primary: { main: '#3b82f6' },  
    success: { main: '#10b981' },  
    warning: { main: '#f59e0b' },  
    error: { main: '#ef4444' },    
    info: { main: '#06b6d4' },     
    secondary: { main: '#a855f7' },
    text: { primary: '#f8fafc', secondary: '#94a3b8' },
    divider: '#334155',
  },
  typography: { fontFamily: '"Inter", "Helvetica", "Arial", sans-serif' },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
          border: '1px solid #334155',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        },
      },
    },
  },
});

// ==========================================
// 3. WIDGET COMPONENTS
// ==========================================

const Header = ({ liveData }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [anchorEl, setAnchorEl] = useState(null);
  const openStatus = Boolean(anchorEl);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const timeString = currentTime.toLocaleTimeString('en-US', { hour12: false });
  const dateString = currentTime.toLocaleDateString('en-GB', { 
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' 
  });

  // Calculate Network Status
  const networkVal = parseInt(liveData?.network_status || "0");
  let networkColor = 'error.main';
  let networkLabel = 'WEAK';
  
  if (networkVal > 80) {
    networkColor = 'success.main';
    networkLabel = 'STRONG';
  } else if (networkVal >= 50) {
    networkColor = 'warning.main';
    networkLabel = 'MODERATE';
  }

  // Calculate Device Status
  const isConnected = liveData?.status?.toLowerCase().includes('connected');
  const deviceStatusColor = isConnected ? 'success.main' : 'error.main';
  const deviceStatusText = isConnected ? 'Active' : 'Offline';

  return (
    <Box sx={{ bgcolor: 'background.paper', p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 2, mb: 3 }}>
      
      {/* ================= DESKTOP VIEW ================= */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
        
        {/* Left Side: Tata Power Logo & Titles */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <img src={tataLogo} alt="Tata Power" style={{ height: '45px', objectFit: 'contain' }} />
          <Box>
            <Typography variant="h5" fontWeight="bold" lineHeight={1.2}>TataPower</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              TP Kirnali Ltd. 100 MW Solar Plant, Partur
            </Typography>
          </Box>
        </Stack>
        
        {/* Center: IPQS Logo & Dashboard Title */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <img src={ipqsLogo} alt="IPQS" style={{ height: '30px', objectFit: 'contain' }} />
          <Typography variant="subtitle1" fontWeight={600} letterSpacing={2} color="text.secondary">
            ENERGY MONITORING DASHBOARD
          </Typography>
        </Stack>
        
        {/* Right Side: Status, Network, Time, Logout */}
        <Stack direction="row" alignItems="center" spacing={3}>
          <Box>
            <Button
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                bgcolor: 'background.default', borderRadius: '20px', px: 2, py: 0.5,
                textTransform: 'none', color: 'text.primary', border: '1px solid', borderColor: 'divider',
                '&:hover': { bgcolor: alpha('#334155', 0.8) }
              }}
              startIcon={<Circle sx={{ color: deviceStatusColor, fontSize: '12px !important' }} />}
              endIcon={<KeyboardArrowDown sx={{ color: 'text.secondary' }} />}
            >
              <Typography fontWeight="bold">{deviceStatusText}</Typography>
            </Button>
          </Box>

          <Stack direction="row" alignItems="center" spacing={1} sx={{ color: networkColor }}>
            <SignalCellularAlt />
            <Typography fontWeight="bold">{networkLabel}</Typography>
          </Stack>

          <Box textAlign="right" sx={{ minWidth: 120 }}>
            <Typography variant="body1" fontWeight="bold">{timeString}</Typography>
            <Typography variant="caption" color="text.secondary">{dateString}</Typography>
          </Box>
          
          <Button variant="outlined" color="error" size="small" endIcon={<Logout />} onClick={handleLogout} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
            Logout
          </Button>
        </Stack>
      </Stack>

      {/* ================= MOBILE VIEW ================= */}
      <Stack spacing={2.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
        {/* Row 1: Logo & Logout */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <img src={tataLogo} alt="Tata Power" style={{ height: '36px', objectFit: 'contain' }} />
            <Box>
              <Typography variant="h6" fontWeight="bold" lineHeight={1.2}>TataPower</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                TP Kirnali Ltd. 100 MW Solar Plant, Partur
              </Typography>
            </Box>
          </Stack>
          <IconButton 
            variant="outlined" 
            color="error" 
            onClick={handleLogout} 
            size="small"
            sx={{ border: '1px solid', borderColor: alpha('#ef4444', 0.5), borderRadius: 2 }}
          >
            <Logout fontSize="small" />
          </IconButton>
        </Stack>

        {/* Row 2: IPQS Logo & Title (Mobile) */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ bgcolor: 'background.default', p: 1, borderRadius: 2 }}>
          <img src={ipqsLogo} alt="IPQS" style={{ height: '20px', objectFit: 'contain' }} />
          <Typography variant="caption" fontWeight={600} letterSpacing={1} color="text.secondary">
            ENERGY MONITORING DASHBOARD
          </Typography>
        </Stack>

        {/* Row 3: Device Status & Network */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button
            onClick={(e) => setAnchorEl(e.currentTarget)}
            size="small"
            sx={{
              bgcolor: 'background.default', borderRadius: '20px', px: 1.5, py: 0.5,
              textTransform: 'none', color: 'text.primary', border: '1px solid', borderColor: 'divider',
            }}
            startIcon={<Circle sx={{ color: deviceStatusColor, fontSize: '10px !important' }} />}
            endIcon={<KeyboardArrowDown sx={{ color: 'text.secondary', fontSize: '18px !important' }} />}
          >
            <Typography variant="body2" fontWeight="bold">{deviceStatusText}</Typography>
          </Button>

          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: networkColor }}>
            <SignalCellularAlt fontSize="small" />
            <Typography variant="body2" fontWeight="bold">{networkLabel}</Typography>
          </Stack>
        </Stack>
      </Stack>

      {/* Shared Dropdown Menu */}
      <Menu
        anchorEl={anchorEl} open={openStatus} onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'center', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        PaperProps={{ sx: { mt: 1, minWidth: 220, borderRadius: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: 3 } }}
      >
        <Box sx={{ px: 2.5, py: 1.5 }}>
          <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1} display="block" mb={0.5}>Device Name</Typography>
          <Typography variant="body1" fontWeight="bold">Main Factory V1</Typography>
          <Divider sx={{ my: 1.5, borderColor: 'divider' }} />
          <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1} display="block" mb={0.5}>Device ID</Typography>
          <Typography variant="body2" fontFamily="monospace" color="primary.main" fontWeight="bold">{liveData?.device_id || "DEV122240"}</Typography>
        </Box>
      </Menu>

    </Box>
  );
};

const MetricBox = ({ title, value, unit, color }) => (
  <Box sx={{ p: 1.5, borderRadius: 2, textAlign: 'center', bgcolor: alpha(color, 0.1), border: `1px solid ${color}` }}>
    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>{title}</Typography>
    <Typography variant="h5" fontWeight="bold" color="text.primary">{value} <Typography component="span" variant="body2" color="text.secondary">{unit}</Typography></Typography>
  </Box>
);

const PhaseParameters = ({ data }) => {
  return (
    <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="subtitle1" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>Phase Electrical Parameters</Typography>
        <ElectricalServices color="warning" />
      </Stack>
      <Grid container spacing={1.5} mb={3}>
        <Grid size={{ xs: 12, sm: 2.4 }}><MetricBox title="AVG VOLTAGE" value={formatVoltageToKV(data?.voltage)} unit="kV" color="#3b82f6" /></Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}><MetricBox title="AVG CURRENT" value={data?.current ?? '--'} unit="A" color="#10b981" /></Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}><MetricBox title="ACTIVE PWR" value={formatToMega(data?.kw)} unit="MW" color="#f59e0b" /></Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}><MetricBox title="REACTIVE PWR" value={formatToMega(data?.kvar)} unit="MVAr" color="#a855f7" /></Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}><MetricBox title="APPARENT PWR" value={formatToMega(data?.kva)} unit="MVA" color="#06b6d4" /></Grid>
      </Grid>
      <Box sx={{ overflowX: 'auto', mt: 'auto' }}>
        <Table sx={{ minWidth: 500, borderSpacing: '0 15px', borderCollapse: 'separate' }}>
          <TableHead>
            <TableRow>
              {['Voltage (kV)', 'Current (A)', 'Active Pwr (MW)', 'Reactive (MVAr)', 'Apparent (MVA)'].map((head) => (
                <TableCell key={head} align="center" sx={{ color: 'text.secondary', fontWeight: 600, borderBottom: 'none', py: 0 }}>
                  {head.split(' ')[0]} <br/> <Typography variant="caption" fontWeight={400}>{head.split(' ')[1]}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              { v: formatVoltageToKV(data?.voltage_r), i: data?.current_r ?? '--', kw: formatToMega(data?.kw_r), kvar: formatToMega(data?.kvar_r), kva: formatToMega(data?.kva_r), color: '#ef4444' },
              { v: formatVoltageToKV(data?.voltage_y), i: data?.current_y ?? '--', kw: formatToMega(data?.kw_y), kvar: formatToMega(data?.kvar_y), kva: formatToMega(data?.kva_y), color: '#f59e0b' },
              { v: formatVoltageToKV(data?.voltage_b), i: data?.current_b ?? '--', kw: formatToMega(data?.kw_b), kvar: formatToMega(data?.kvar_b), kva: formatToMega(data?.kva_b), color: '#3b82f6' },
            ].map((row, index) => (
              <TableRow key={index} sx={{ '& td': { bgcolor: alpha(row.color, 0.08), borderBottom: 'none', py: 2, fontSize: '1.2rem', fontWeight: 600, textAlign: 'center' } }}>
                <TableCell sx={{ borderLeft: `6px solid ${row.color}`, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }}>{row.v}</TableCell>
                <TableCell>{row.i}</TableCell>
                <TableCell>{row.kw}</TableCell>
                <TableCell>{row.kvar}</TableCell>
                <TableCell sx={{ borderTopRightRadius: 8, borderBottomRightRadius: 8 }}>{row.kva}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
};

const PfItem = ({ label, value, color }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2, borderLeft: '5px solid', borderColor: color }}>
    <Typography variant="body2" color="text.secondary" fontWeight={600} letterSpacing={1}>{label}</Typography>
    <Typography variant="h6" fontWeight="bold" sx={{ color }}>{value}</Typography>
  </Stack>
);

const SystemPowerFactor = ({ data }) => {
  const pf = parseFloat(data?.power_factor ?? 0);
  const pfPercent = Math.min(Math.max(pf * 100, 0), 100);

  return (
    <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="subtitle1" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>System Power Factor</Typography>
        <Speed color="success" />
      </Stack>
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 'auto', py: 2 }}>
        <Box sx={{ 
          width: 180, height: 180, borderRadius: '50%', 
          background: `conic-gradient(#10b981 ${pfPercent}%, #334155 0)`, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', 
          '&::after': { content: '""', position: 'absolute', width: 'calc(100% - 20px)', height: 'calc(100% - 20px)', bgcolor: 'background.paper', borderRadius: '50%' } 
        }}>
          <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <Typography variant="h3" fontWeight="bold">{data?.power_factor ?? '--'}</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing={1}>SYSTEM PF</Typography>
          </Box>
        </Box>
      </Box>
      <Stack spacing={1.5} mt={2}>
        <PfItem label="PHASE 1 (R)" value={data?.pf_r ?? '--'} color="error.main" />
        <PfItem label="PHASE 2 (Y)" value={data?.pf_y ?? '--'} color="warning.main" />
        <PfItem label="PHASE 3 (B)" value={data?.pf_b ?? '--'} color="primary.main" />
      </Stack>
    </Card>
  );
};

const EnergyBox = ({ title, value, unit, color }) => (
  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 2.5, borderRadius: 2, textAlign: 'center', bgcolor: alpha(color, 0.08), border: `1px solid ${alpha(color, 0.4)}` }}>
    <Typography variant="body2" color="text.secondary" fontWeight={600} letterSpacing={1} mb={1}>{title}</Typography>
    <Typography variant="h3" fontWeight="bold">{value} <Typography component="span" variant="subtitle1" color="text.secondary">{unit}</Typography></Typography>
  </Box>
);

const TotalEnergy = ({ data }) => (
  <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Stack direction="row" justifyContent="space-between" mb={3}>
      <Typography variant="subtitle1" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>Total Energy</Typography>
      <TrendingUp color="primary" />
    </Stack>
    <Stack spacing={2.5} sx={{ flex: 1, height: '100%' }}>
      <EnergyBox title="ACTIVE ENERGY" value={formatToMega(data?.kwh)} unit="MWh" color="#3b82f6" />
      <EnergyBox title="REACTIVE ENERGY" value={formatToMega(data?.kvarh ?? data?.kvarhlag)} unit="MVArh" color="#a855f7" />
    </Stack>
  </Card>
);

// ==========================================
// 4. API INTEGRATED MONTHLY ANALYSIS
// ==========================================
const MonthlyAnalysis = () => {
  const [selectedYear, setSelectedYear] = useState('2026');
  const [apiData, setApiData] = useState([]);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3001/api/monthly/device/DEV122240', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setApiData(data);
        } else {
          console.error("Failed to fetch monthly data");
        }
      } catch (error) {
        console.error("Error connecting to monthly API:", error);
      }
    };

    fetchMonthlyData();
  }, []);

  const monthsLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const chartData = monthsLabels.map((monthStr, index) => {
    const monthNum = (index + 1).toString().padStart(2, '0');
    const targetMonth = `${selectedYear}-${monthNum}`;
    
    const foundData = apiData.find(d => d.month === targetMonth);
    const pfValue = foundData ? parseFloat(foundData.power_factor || 0) : 0;
    
    const heightPercent = pfValue > 0 ? Math.min(100, Math.max(5, pfValue * 100)) : 5; 

    return {
      month: monthStr,
      val: pfValue > 0 ? pfValue.toFixed(3) : '0.000',
      height: `${heightPercent}%`,
      highlight: pfValue >= 0.95
    };
  });

  return (
    <Card sx={{ p: 3, mt: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'flex-start' }} spacing={2} mb={4}>
        <Box>
          <Typography variant="h6" fontWeight="bold">Monthly Power Factor Analysis</Typography>
          <Typography variant="caption" color="text.secondary">Efficiency tracking Jan - Dec</Typography>
        </Box>
        
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            size="small"
            sx={{
              height: 32, fontSize: '0.875rem', bgcolor: 'background.default', color: 'text.secondary',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' }
            }}
          >
            <MenuItem value="2024">2024</MenuItem>
            <MenuItem value="2025">2025</MenuItem>
            <MenuItem value="2026">2026</MenuItem>
          </Select>
          <Stack direction="row" spacing={3}>
            <Typography variant="body2" color="primary.main" display="flex" alignItems="center" gap={1}><BarChart fontSize="small" /> PF Trend</Typography>
            <Typography variant="body2" color="success.main">— 0.950 Threshold</Typography>
          </Stack>
        </Stack>
      </Stack>
      
      <Box sx={{ width: '100%', overflowX: 'auto', pb: 1, WebkitOverflowScrolling: 'touch' }}>
        <Box sx={{ minWidth: 650, display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: 220, position: 'relative', pb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ position: 'absolute', bottom: '30%', width: '100%', borderTop: '1px dashed', borderColor: 'success.main', opacity: 0.6, zIndex: 1 }} />
          <Typography variant="caption" sx={{ position: 'absolute', right: 0, bottom: 'calc(30% + 5px)', color: 'success.main', zIndex: 1, fontWeight: 600 }}>Target 0.950</Typography>
          
          {chartData.map((item, index) => (
            <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', width: 60, height: '100%', zIndex: 2, position: 'relative' }}>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 1.5, color: item.highlight ? 'success.main' : 'text.primary', textShadow: '0 2px 5px rgba(0,0,0,0.8)' }}>
                {item.val}
              </Typography>
              <Box sx={{ 
                width: 40, height: item.height, 
                background: 'linear-gradient(to right, #1e3a8a 0%, #3b82f6 35%, #93c5fd 65%, #1e3a8a 100%)', 
                borderRadius: '0 0 4px 4px', position: 'relative', boxShadow: '8px 5px 15px rgba(0,0,0,0.3)', 
                '&::before': { content: '""', position: 'absolute', top: -8, left: 0, width: '100%', height: 16, borderRadius: '50%', bgcolor: '#bfdbfe', boxShadow: 'inset 0 -2px 6px rgba(0,0,0,0.4)' },
                transition: 'height 0.5s ease-in-out'
              }} />
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" sx={{ position: 'absolute', bottom: -28 }}>
                {item.month}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  );
};

const SummaryBox = ({ title, energy, pf, progress }) => (
  <Box sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
    <Typography variant="caption" color="text.secondary" textTransform="uppercase" mb={1} display="block">{title}</Typography>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
      <Box>
        <Typography variant="caption" color="text.secondary">Energy</Typography>
        <Typography variant="h5" fontWeight="bold">{energy.val} <Typography component="span" variant="body2" color="text.secondary">{energy.unit}</Typography></Typography>
      </Box>
      <Box textAlign="right">
        <Typography variant="caption" color="text.secondary">PF</Typography>
        <Typography variant="h6" fontWeight="bold">{pf}</Typography>
      </Box>
    </Stack>
    <Box sx={{ mt: 1.5, height: 4, bgcolor: '#334155', borderRadius: 1 }}>
      <Box sx={{ width: progress, height: '100%', bgcolor: 'primary.main', borderRadius: 1 }} />
    </Box>
  </Box>
);

const RealTimeParameters = () => {
  const [tab, setTab] = useState(0);
  const [paramFilter, setParamFilter] = useState('All');
  const [anchorElParam, setAnchorElParam] = useState(null);
  const openParam = Boolean(anchorElParam);

  const graphData = {
    0: {
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
      paths: {
        Voltage: { color: '#f59e0b', d: "M0,40 Q300,35 700,50 T1400,45" },
        MWh:     { color: '#3b82f6', d: "M0,80 Q250,60 500,90 T1000,75 T1400,85" },
        Current: { color: '#ef4444', d: "M0,110 Q400,125 700,105 T1400,115" },
        MVArh:   { color: '#10b981', d: "M0,135 Q300,130 600,140 T1000,135 T1400,140" },
      }
    },
    1: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      paths: {
        Voltage: { color: '#f59e0b', d: "M0,50 Q300,60 700,40 T1400,55" },
        MWh:     { color: '#3b82f6', d: "M0,90 Q200,110 400,70 T800,80 T1400,60" },
        Current: { color: '#ef4444', d: "M0,120 Q400,100 700,115 T1400,110" },
        MVArh:   { color: '#10b981', d: "M0,140 Q300,135 600,145 T1000,135 T1400,145" },
      }
    },
    2: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
      paths: {
        Voltage: { color: '#f59e0b', d: "M0,45 Q350,30 700,55 T1400,40" },
        MWh:     { color: '#3b82f6', d: "M0,75 Q350,95 700,65 T1400,80" },
        Current: { color: '#ef4444', d: "M0,105 Q350,120 700,100 T1400,125" },
        MVArh:   { color: '#10b981', d: "M0,130 Q350,145 700,135 T1400,140" },
      }
    },
    3: {
      labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov', 'Dec'],
      paths: {
        Voltage: { color: '#f59e0b', d: "M0,35 Q300,50 700,30 T1400,45" },
        MWh:     { color: '#3b82f6', d: "M0,65 Q250,85 600,60 T1000,90 T1400,70" },
        Current: { color: '#ef4444', d: "M0,115 Q400,105 700,125 T1400,100" },
        MVArh:   { color: '#10b981', d: "M0,145 Q300,130 600,140 T1000,135 T1400,140" },
      }
    }
  };

  const currentGraph = graphData[tab];

  return (
    <Card sx={{ p: 3, mt: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} borderBottom="1px solid" borderColor="divider" pb={1} mb={3} spacing={2}>
        <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <Tabs value={tab} onChange={(e, v) => setTab(v)} textColor="primary" indicatorColor="primary" variant="scrollable" scrollButtons="auto">
            <Tab label="Today" sx={{ textTransform: 'none', fontWeight: 500 }} />
            <Tab label="Weekly" sx={{ textTransform: 'none', fontWeight: 500 }} />
            <Tab label="Monthly" sx={{ textTransform: 'none', fontWeight: 500 }} />
            <Tab label="Yearly" sx={{ textTransform: 'none', fontWeight: 500 }} />
          </Tabs>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button 
            variant="outlined" color="inherit" 
            onClick={(e) => setAnchorElParam(e.currentTarget)}
            endIcon={<KeyboardArrowDown />}
            sx={{ color: 'text.secondary', borderColor: 'divider', textTransform: 'none' }}
          >
            {paramFilter === 'All' ? 'Parameters' : paramFilter}
          </Button>
          <Menu anchorEl={anchorElParam} open={openParam} onClose={() => setAnchorElParam(null)}>
            {['All', 'MWh', 'MVArh', 'Voltage', 'Current'].map(opt => (
              <MenuItem key={opt} onClick={() => { setParamFilter(opt); setAnchorElParam(null); }}>{opt}</MenuItem>
            ))}
          </Menu>
          <IconButton sx={{ bgcolor: 'divider', color: 'white', borderRadius: 1 }}><Download fontSize="small" /></IconButton>
        </Stack>
      </Stack>
      
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={2} spacing={2}>
        <Typography variant="subtitle2" fontWeight="bold" textTransform="uppercase" letterSpacing={1}>REAL-TIME PARAMETERS</Typography>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          {[{l: 'MWh', c: 'primary.main'}, {l: 'MVArh', c: 'success.main'}, {l: 'Voltage', c: 'warning.main'}, {l: 'Current', c: 'error.main'}].map(item => (
            <Typography key={item.l} variant="caption" color={item.c} display="flex" alignItems="center" gap={0.5}>
              <Circle sx={{ fontSize: 8 }} /> {item.l}
            </Typography>
          ))}
        </Stack>
      </Stack>
      
      <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <Box sx={{ minWidth: 600, height: 180, borderLeft: '1px solid', borderBottom: '1px solid', borderColor: 'divider', mt: 2 }}>
          <svg width="100%" height="100%" viewBox="0 0 1400 150" preserveAspectRatio="none">
            {Object.keys(currentGraph.paths).map(key => {
              if (paramFilter !== 'All' && paramFilter !== key) return null;
              return (
                <path 
                  key={key} d={currentGraph.paths[key].d} 
                  fill="none" stroke={currentGraph.paths[key].color} strokeWidth="2.5"
                  style={{ transition: 'd 0.5s ease-in-out, stroke-opacity 0.3s' }}
                />
              )
            })}
          </svg>
        </Box>
        <Stack direction="row" justifyContent="space-between" mt={1} pl={1} sx={{ minWidth: 600 }}>
          {currentGraph.labels.map(t => (
            <Typography key={t} variant="caption" color="text.secondary">{t}</Typography>
          ))}
        </Stack>
      </Box>
      
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mt={4}>
        <Box flex={1}><SummaryBox title="Daily Summary" energy={{ val: '0.45', unit: 'MWh' }} pf="0.98" progress="70%" /></Box>
        <Box flex={1}><SummaryBox title="Monthly Summary" energy={{ val: '12.45', unit: 'MWh' }} pf="0.96" progress="85%" /></Box>
        <Box flex={1}><SummaryBox title="Yearly Summary" energy={{ val: '145.2', unit: 'MWh' }} pf="0.95" progress="95%" /></Box>
      </Stack>
    </Card>
  );
};

// ==========================================
// 5. MAIN DASHBOARD LAYOUT & SOCKET LISTENER
// ==========================================
const Dashboard = () => {
  const [liveData, setLiveData] = useState(null);

  useEffect(() => {
    const deviceId = "DEV122240";
    const eventName = `device-data-${deviceId}`;

    console.log(`🔌 Attempting to connect to socket and listen for: ${eventName}`);

    socket.on('connect', () => console.log('✅ Socket connected successfully! ID:', socket.id));
    socket.on('connect_error', (err) => console.error('❌ Socket connection error:', err));

    const handleData = (incoming) => {
      let parsedData = incoming;
      if (typeof incoming === 'string') {
        try {
          parsedData = JSON.parse(incoming);
        } catch (error) {
          console.error('⚠️ Failed to parse incoming socket data:', error);
          return;
        }
      }
      setLiveData(parsedData);
    };

    socket.on(eventName, handleData);

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off(eventName, handleData);
    };
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh', width: '100%', p: { xs: 1.5, md: 3 },
        backgroundImage: `linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)`,
        backgroundSize: '30px 30px'
      }}
    >
      <Header liveData={liveData} />

      <Grid container spacing={3} sx={{ width: '100%', margin: 0 }}>
        <Grid size={{ xs: 12, lg: 7 }}><PhaseParameters data={liveData} /></Grid>
        <Grid size={{ xs: 12, md: 6, lg: 3 }}><SystemPowerFactor data={liveData} /></Grid>
        <Grid size={{ xs: 12, md: 6, lg: 2 }}><TotalEnergy data={liveData} /></Grid>
      </Grid>

      <MonthlyAnalysis />
      <RealTimeParameters />
    </Box>
  );
};

export default function TataPowerDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, [navigate]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Dashboard />
    </ThemeProvider>
  );
}