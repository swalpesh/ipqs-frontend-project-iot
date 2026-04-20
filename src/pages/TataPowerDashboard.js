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

// Displays raw value directly from JSON (handles null/undefined and formats to 3 decimals)
const formatValue = (val) => {
  if (val === undefined || val === null || val === '') return '--';
  const num = parseFloat(val);
  return isNaN(num) ? '--' : num.toFixed(3);
};

// Converts raw voltage to kV by dividing by 1000 (handles null/undefined)
const formatVoltage = (val) => {
  if (val === undefined || val === null || val === '') return '--';
  const num = parseFloat(val);
  return isNaN(num) ? '--' : (num / 1000).toFixed(2); 
};

// Custom logic to drop digits based on your exact requirements (using Math.trunc)
const formatEnergyCustom = (val, divisor) => {
  if (val === undefined || val === null || val === '') return '--';
  const num = parseFloat(val);
  if (isNaN(num)) return '--';
  return Math.trunc(num / divisor).toString();
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
            ENERGY MONITORING DASHBOARD (LIVE)
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

        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ bgcolor: 'background.default', p: 1, borderRadius: 2 }}>
          <img src={ipqsLogo} alt="IPQS" style={{ height: '20px', objectFit: 'contain' }} />
          <Typography variant="caption" fontWeight={600} letterSpacing={1} color="text.secondary">
            ENERGY MONITORING DASHBOARD (LIVE)
          </Typography>
        </Stack>

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
  <Box sx={{ 
    p: 2.5, 
    borderRadius: 2, 
    textAlign: 'center', 
    bgcolor: alpha(color, 0.1), 
    border: `1px solid ${color}`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%' 
  }}>
    <Typography 
      variant="h6" 
      color="text.secondary" 
      fontWeight={600} 
      display="block" 
      mb={1} 
      sx={{ fontSize: '1.05rem', whiteSpace: 'nowrap' }}
    >
      {title}
    </Typography>
    <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ mb: 0.5 }}>
      {value}
    </Typography>
    <Typography variant="body1" color="text.secondary" fontWeight={600}>
      {unit}
    </Typography>
  </Box>
);

const PhaseParameters = ({ data }) => {
  return (
    <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="subtitle1" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>Phase Electrical Parameters</Typography>
        <ElectricalServices color="warning" />
      </Stack>
      <Grid container spacing={2} mb={4} alignItems="stretch">
        <Grid size={{ xs: 12, sm: 2.4 }}><MetricBox title="Average Voltage" value={formatVoltage(data?.voltage)} unit="kV" color="#3b82f6" /></Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}><MetricBox title="Average Current" value={formatValue(data?.current)} unit="A" color="#10b981" /></Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}><MetricBox title="Active Power" value={formatValue(data?.kw)} unit="MW" color="#f59e0b" /></Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}><MetricBox title="Reactive Power" value={formatValue(data?.kvar)} unit="MVAr" color="#a855f7" /></Grid>
        <Grid size={{ xs: 12, sm: 2.4 }}><MetricBox title="Apparent Power" value={formatValue(data?.kva)} unit="MVA" color="#06b6d4" /></Grid>
      </Grid>
      <Box sx={{ overflowX: 'auto', mt: 'auto' }}>
        <Table sx={{ minWidth: 500, borderSpacing: '0 15px', borderCollapse: 'separate' }}>
          <TableHead>
            <TableRow>
              {['Voltage (kV)', 'Current (A)', 'Active (MW)', 'Reactive (MVAr)', 'Apparent (MVA)'].map((head) => (
                <TableCell key={head} align="center" sx={{ color: 'text.secondary', fontWeight: 600, borderBottom: 'none', py: 1, fontSize: '1.1rem' }}>
                  {head.split(' ')[0]} <br/> <Typography variant="body2" fontWeight={500} mt={0.5}>{head.split(' ')[1]}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              { v: formatVoltage(data?.voltage_r), i: formatValue(data?.current_r), kw: formatValue(data?.kw_r), kvar: formatValue(data?.kvar_r), kva: formatValue(data?.kva_r), color: '#ef4444' },
              { v: formatVoltage(data?.voltage_y), i: formatValue(data?.current_y), kw: formatValue(data?.kw_y), kvar: formatValue(data?.kvar_y), kva: formatValue(data?.kva_y), color: '#f59e0b' },
              { v: formatVoltage(data?.voltage_b), i: formatValue(data?.current_b), kw: formatValue(data?.kw_b), kvar: formatValue(data?.kvar_b), kva: formatValue(data?.kva_b), color: '#3b82f6' },
            ].map((row, index) => (
              <TableRow key={index} sx={{ '& td': { bgcolor: alpha(row.color, 0.08), borderBottom: 'none', py: 2.5, fontSize: '1.4rem', fontWeight: 600, textAlign: 'center' } }}>
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
  const pfPercent = Math.min(Math.max(Math.abs(pf) * 100, 0), 100);

  return (
    <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="subtitle1" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>System Power Factor</Typography>
        <Speed color="success" />
      </Stack>
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 'auto', py: 2 }}>
        <Box sx={{ 
          width: 160, height: 160, borderRadius: '50%', 
          background: `conic-gradient(#10b981 ${pfPercent}%, #334155 0)`, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', 
          '&::after': { content: '""', position: 'absolute', width: 'calc(100% - 20px)', height: 'calc(100% - 20px)', bgcolor: 'background.paper', borderRadius: '50%' } 
        }}>
          <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="bold">{formatValue(data?.power_factor)}</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing={1}>SYSTEM PF</Typography>
          </Box>
        </Box>
      </Box>
      <Stack spacing={1.5} mt={2}>
        <PfItem label="PHASE (R)" value={formatValue(data?.pf_r)} color="error.main" />
        <PfItem label="PHASE (Y)" value={formatValue(data?.pf_y)} color="warning.main" />
        <PfItem label="PHASE (B)" value={formatValue(data?.pf_b)} color="primary.main" />
      </Stack>
    </Card>
  );
};

const EnergyBox = ({ title, value, unit, color }) => (
  <Box sx={{ 
    flex: 1, 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    p: 1.5, 
    borderRadius: 2, 
    textAlign: 'center', 
    bgcolor: alpha(color, 0.08), 
    border: `1px solid ${alpha(color, 0.4)}` 
  }}>
    <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing={1} mb={0.5} textTransform="uppercase">
      {title}
    </Typography>
    <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary', mb: 0 }}>
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {unit}
    </Typography>
  </Box>
);

const TotalEnergy = ({ data }) => (
  <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Stack direction="row" justifyContent="space-between" mb={2}>
      <Typography variant="subtitle1" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>Total Energy</Typography>
      <TrendingUp color="primary" />
    </Stack>
    <Stack spacing={1.5} sx={{ flex: 1, height: '100%' }}>
      {/* Ordered explicitly as requested, using formatEnergyCustom with precise divisors */}
      <EnergyBox title="kWh Import" value={formatEnergyCustom(data?.kwh_import, 1000)} unit="MWh" color="#3b82f6" />
      <EnergyBox title="kWh Export" value={formatEnergyCustom(data?.kwh_export, 1000)} unit="MWh" color="#3b82f6" />
      
      <EnergyBox title="kVAh Import" value={formatEnergyCustom(data?.kvah_import, 1000)} unit="MVAh" color="#06b6d4" />
      <EnergyBox title="kVAh Export" value={formatEnergyCustom(data?.kvah_export, 1000)} unit="MVAh" color="#06b6d4" />
      
      <EnergyBox title="kVArh Import" value={formatEnergyCustom(data?.kvarh_import, 10)} unit="MVArh" color="#a855f7" />
      <EnergyBox title="kVArh Export" value={formatEnergyCustom(data?.kvarh_export, 100)} unit="MVArh" color="#a855f7" />
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
        const response = await fetch('https://ipqsoms.com/api/monthly/device/DEV122240', {
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

      // 1. Flatten the data object if measurements are nested inside a "data" property
      let flatData = { ...parsedData };
      if (parsedData && parsedData.data && typeof parsedData.data === 'object') {
         flatData = { ...parsedData, ...parsedData.data };
      }

      // 2. Normalize all keys to lowercase to avoid issues between "Kvarh" and "kvarh"
      let normalizedData = {};
      if (flatData) {
         Object.keys(flatData).forEach(key => {
            normalizedData[key.toLowerCase()] = flatData[key];
         });
      }

      // 3. Handle naming fallbacks (e.g., if 'powerfactor' is sent instead of 'power_factor')
      if (normalizedData.powerfactor !== undefined && normalizedData.power_factor === undefined) {
         normalizedData.power_factor = normalizedData.powerfactor;
      }
      if (normalizedData.kvarhlag !== undefined && normalizedData.kvarh === undefined) {
         normalizedData.kvarh = normalizedData.kvarhlag;
      }

      console.log('✅ Normalized Data for UI:', normalizedData);
      setLiveData(normalizedData);
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
        <Grid size={{ xs: 12, lg: 7.8 }}><PhaseParameters data={liveData} /></Grid>
        <Grid size={{ xs: 12, md: 6, lg: 2.2 }}><SystemPowerFactor data={liveData} /></Grid>
        <Grid size={{ xs: 12, md: 6, lg: 2 }}><TotalEnergy data={liveData} /></Grid>
      </Grid>

      <MonthlyAnalysis />
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