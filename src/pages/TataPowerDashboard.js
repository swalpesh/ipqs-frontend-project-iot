import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { 
  Box, Grid, Stack, Card, Typography, Table, TableBody, 
  TableCell, TableHead, TableRow, Button, IconButton, 
  ThemeProvider, CssBaseline, createTheme, Menu, MenuItem, Divider,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField 
} from '@mui/material';
import { alpha, keyframes, styled } from '@mui/material/styles';
import { 
  SignalCellularAlt, ElectricalServices, TrendingUp,
  Circle, Logout, KeyboardArrowDown, Speed,
  WbSunny, CloudQueue, Opacity, Thunderstorm, Air, NightsStay
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

const formatValue = (val) => {
  if (val === undefined || val === null || val === '') return '--';
  const num = parseFloat(val);
  return isNaN(num) ? '--' : num.toFixed(3);
};

const formatVoltage = (val) => {
  if (val === undefined || val === null || val === '') return '--';
  const num = parseFloat(val);
  return isNaN(num) ? '--' : (num / 1000).toFixed(2); 
};

const formatEnergyCustom = (val, divisor) => {
  if (val === undefined || val === null || val === '') return '--';
  const num = parseFloat(val);
  if (isNaN(num)) return '--';
  return Math.trunc(num / divisor).toString();
};

// ==========================================
// 2. THEME & ANIMATIONS
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
          borderRadius: 16, 
          backgroundImage: 'none',
          border: '1px solid #334155',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#334155' },
            '&:hover fieldset': { borderColor: '#3b82f6' },
          },
        },
      },
    },
  },
});

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

const PremiumWeatherCard = styled(Card)(({ theme, condition }) => {
  let bgGradient = 'linear-gradient(to bottom, #1e293b, #0f172a)';

  if (condition === 'day-clear') {
    bgGradient = 'linear-gradient(to bottom, #38bdf8, #2563eb)'; 
  } else if (condition === 'night-clear') {
    bgGradient = 'linear-gradient(to bottom, #0f172a, #020617)'; 
  } else if (condition === 'cloudy') {
    bgGradient = 'linear-gradient(to bottom, #64748b, #334155)'; 
  } else if (condition === 'rainy') {
    bgGradient = 'linear-gradient(to bottom, #475569, #1e293b)'; 
  }

  return {
    padding: 0, 
    display: 'flex',
    flexDirection: 'column',
    background: bgGradient,
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: 'inset 0 0 60px rgba(0,0,0,0.2)', 
    position: 'relative',
    overflow: 'hidden',
    flex: 1 
  };
});

// ==========================================
// 3. WIDGET COMPONENTS
// ==========================================

const Header = ({ liveData }) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [anchorEl, setAnchorEl] = useState(null);
  const openStatus = Boolean(anchorEl);

  // Modal State
  const [openCredModal, setOpenCredModal] = useState(false);
  const [formData, setFormData] = useState({
    companyId: 'TataPowerLtd.',
    username: '',
    password: '',
    securityCode: ''
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    socket.disconnect(); // Stop live data
    localStorage.clear();
    window.location.href = '/login'; // Full reload to clear memory
  };

  const handleOpenCredModal = () => {
    setAnchorEl(null);
    setOpenCredModal(true);
  };

  const handleCredSubmit = async () => {
    try {
      const response = await fetch(`https://ipqsoms.com/api/companies/${formData.companyId}/credentials`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          company_username: formData.username,
          company_password: formData.password,
          Supersecuritycode: formData.securityCode
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Success: " + data.message);
        setOpenCredModal(false);
        // Clear token and disconnect socket so live data stops
        socket.disconnect();
        localStorage.clear();
        // Redirect to login (using window.location to strictly wipe memory state)
        window.location.href = '/login';
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      console.error("Error updating credentials:", error);
      alert("An error occurred while connecting to the server.");
    }
  };

  const timeString = currentTime.toLocaleTimeString('en-US', { hour12: false });
  const dateString = currentTime.toLocaleDateString('en-GB', { 
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' 
  });

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

  const isConnected = liveData?.status?.toLowerCase().includes('connected');
  const deviceStatusColor = isConnected ? 'success.main' : 'error.main';
  const deviceStatusText = isConnected ? 'Active' : 'Offline';

  return (
    <Box sx={{ bgcolor: 'background.paper', p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 2, mb: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <img src={tataLogo} alt="Tata Power" style={{ height: '45px', objectFit: 'contain' }} />
          <Box>
            <Typography variant="h5" fontWeight="bold" lineHeight={1.2}>TataPower</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              TP Kirnali Ltd. 100 MW Solar Plant, Partur
            </Typography>
          </Box>
        </Stack>
        
        <Stack direction="row" alignItems="center" spacing={2}>
          <img src={ipqsLogo} alt="IPQS" style={{ height: '30px', objectFit: 'contain' }} />
          <Typography variant="subtitle1" fontWeight={600} letterSpacing={2} color="text.secondary">
            ENERGY MONITORING DASHBOARD (LIVE)
          </Typography>
        </Stack>
        
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

          <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'Orange' }}>
            <SignalCellularAlt />
            <Typography fontWeight="bold">MODERATE</Typography>
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
          <IconButton variant="outlined" color="error" onClick={handleLogout} size="small" sx={{ border: '1px solid', borderColor: alpha('#ef4444', 0.5), borderRadius: 2 }}>
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
            sx={{ bgcolor: 'background.default', borderRadius: '20px', px: 1.5, py: 0.5, textTransform: 'none', color: 'text.primary', border: '1px solid', borderColor: 'divider' }}
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
        <Divider sx={{ borderColor: 'divider' }} />
        <MenuItem onClick={handleOpenCredModal} sx={{ px: 2.5, py: 1.5, color: 'primary.main', fontWeight: 600, '&:hover': { bgcolor: alpha('#3b82f6', 0.1) } }}>
          Change Credentials
        </MenuItem>
      </Menu>

      <Dialog 
        open={openCredModal} 
        onClose={() => setOpenCredModal(false)}
        PaperProps={{ sx: { bgcolor: 'background.paper', borderRadius: 3, border: '1px solid #334155', minWidth: { xs: '90%', sm: '400px' } } }}
      >
        <DialogTitle fontWeight="bold" sx={{ color: 'text.primary', borderBottom: '1px solid #334155', pb: 2 }}>
          Update Credentials
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={2.5} mt={1}>
            <TextField 
              label="Company ID" 
              size="small" 
              variant="outlined" 
              value={formData.companyId} 
              onChange={(e) => setFormData({...formData, companyId: e.target.value})} 
              fullWidth 
              InputLabelProps={{ style: { color: '#94a3b8' } }}
            />
            <TextField 
              label="New Username" 
              size="small" 
              variant="outlined" 
              value={formData.username} 
              onChange={(e) => setFormData({...formData, username: e.target.value})} 
              fullWidth 
              InputLabelProps={{ style: { color: '#94a3b8' } }}
            />
            <TextField 
              label="New Password" 
              size="small" 
              type="password"
              variant="outlined" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              fullWidth 
              InputLabelProps={{ style: { color: '#94a3b8' } }}
            />
            <TextField 
              label="Super Security Code" 
              size="small" 
              type="password"
              variant="outlined" 
              value={formData.securityCode} 
              onChange={(e) => setFormData({...formData, securityCode: e.target.value})} 
              fullWidth 
              InputLabelProps={{ style: { color: '#94a3b8' } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpenCredModal(false)} sx={{ color: 'text.secondary', fontWeight: 600 }}>Cancel</Button>
          <Button onClick={handleCredSubmit} variant="contained" color="primary" sx={{ fontWeight: 600, borderRadius: 2 }}>Update & Logout</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

const MetricBox = ({ title, value, unit, color }) => (
  <Box sx={{ p: 2.5, borderRadius: 2, textAlign: 'center', bgcolor: alpha(color, 0.1), border: `1px solid ${color}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
    <Typography variant="h6" color="text.secondary" fontWeight={600} display="block" mb={1} sx={{ fontSize: '0.95rem', whiteSpace: 'nowrap' }}>{title}</Typography>
    <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ mb: 0.5 }}>{value}</Typography>
    <Typography variant="body1" color="text.secondary" fontWeight={600}>{unit}</Typography>
  </Box>
);

const PhaseParameters = ({ data }) => (
  <Card sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
    <Stack direction="row" justifyContent="space-between" mb={3}>
      <Typography variant="subtitle1" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>Phase Electrical Parameters</Typography>
      <ElectricalServices color="warning" />
    </Stack>
    
    {/* ROW 1: Main Electrical Metrics */}
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={4} alignItems="stretch" sx={{ flex: 1 }}>
      <Box sx={{ flex: 1 }}><MetricBox title="Avg Voltage" value={formatVoltage(data?.voltage)} unit="kV" color="#3b82f6" /></Box>
      <Box sx={{ flex: 1 }}><MetricBox title="Avg Current" value={formatValue(data?.current)} unit="A" color="#10b981" /></Box>
      <Box sx={{ flex: 1 }}><MetricBox title="Active Power" value={formatValue(data?.kw)} unit="MW" color="#f59e0b" /></Box>
      <Box sx={{ flex: 1 }}><MetricBox title="Reactive Power" value={formatValue(data?.kvar)} unit="MVAr" color="#a855f7" /></Box>
      <Box sx={{ flex: 1 }}><MetricBox title="Apparent Power" value={formatValue(data?.kva)} unit="MVA" color="#06b6d4" /></Box>
    </Stack>

    <Box sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: 600, borderSpacing: '0 15px', borderCollapse: 'separate' }}>
        <TableHead>
          <TableRow>
            {['Voltage (kV)', 'Current (A)', 'Active (MW)', 'Reactive (MVAr)', 'Apparent (MVA)'].map((head) => (
              <TableCell key={head} align="center" sx={{ color: 'text.secondary', fontWeight: 600, borderBottom: 'none', py: 1, fontSize: '1.05rem' }}>
                {head.split(' ')[0]} <br/> <Typography variant="body2" fontWeight={500} mt={0.5}>{head.split(' ').slice(1).join(' ')}</Typography>
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
            <TableRow key={index} sx={{ '& td': { bgcolor: alpha(row.color, 0.08), borderBottom: 'none', py: 2.5, fontSize: '1.3rem', fontWeight: 600, textAlign: 'center' } }}>
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

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=19.5933&longitude=76.2139&current=temperature_2m,is_day,weather_code,wind_speed_10m&daily=sunrise,sunset&timezone=Asia%2FKolkata');
        const data = await response.json();
        
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          isDay: data.current.is_day,
          code: data.current.weather_code,
          wind: data.current.wind_speed_10m,
          sunriseTime: data.daily.sunrise[0], 
          sunsetTime: data.daily.sunset[0],
          sunrise: new Date(data.daily.sunrise[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          sunset: new Date(data.daily.sunset[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        });
      } catch (error) {
        console.error('Weather fetch error:', error);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 120000); 
    return () => clearInterval(interval);
  }, []);

  const getConditionStyle = (code, isDay) => {
    const iconSize = 90;
    if (code === 0) return { label: isDay ? 'Sunny' : 'Clear', theme: isDay ? 'day-clear' : 'night-clear', icon: isDay ? <WbSunny sx={{ fontSize: iconSize, color: '#fde047', animation: `${spin} 20s linear infinite`, filter: 'drop-shadow(0 0 20px rgba(253,224,71,0.6))' }} /> : <NightsStay sx={{ fontSize: iconSize, color: '#e2e8f0', animation: `${float} 6s ease-in-out infinite`, filter: 'drop-shadow(0 0 15px rgba(226,232,240,0.5))' }} /> };
    if (code <= 48) return { label: 'Cloudy', theme: 'cloudy', icon: <CloudQueue sx={{ fontSize: iconSize, color: '#f1f5f9', animation: `${float} 5s ease-in-out infinite`, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }} /> };
    if (code <= 67 || (code >= 80 && code <= 82)) return { label: 'Rainy', theme: 'rainy', icon: <Opacity sx={{ fontSize: iconSize, color: '#93c5fd', animation: `${float} 2s ease-in-out infinite`, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.4))' }} /> };
    if (code >= 95) return { label: 'Storm', theme: 'rainy', icon: <Thunderstorm sx={{ fontSize: iconSize, color: '#cbd5e1', animation: `${float} 2s ease-in-out infinite`, filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }} /> };
    return { label: 'Clear', theme: 'day-clear', icon: <WbSunny sx={{ fontSize: iconSize, color: '#facc15' }} /> };
  };

  const display = weather ? getConditionStyle(weather.code, weather.isDay) : { label: 'Loading...', theme: 'cloudy', icon: <CloudQueue sx={{ fontSize: 90, color: '#cbd5e1' }} /> };

  let sunPercent = 0;
  if (weather) {
    const now = new Date().getTime();
    const rise = new Date(weather.sunriseTime).getTime();
    const set = new Date(weather.sunsetTime).getTime();
    if (now > rise && now < set) {
       sunPercent = ((now - rise) / (set - rise)); 
    } else if (now >= set) {
       sunPercent = 1;
    }
  }

  const width = 200;
  const height = 50;
  const horizonY = 40; 
  const amplitude = 35; 
  const angle = sunPercent * Math.PI;
  const sunX = width * sunPercent; 
  const sunY = horizonY - (Math.sin(angle) * amplitude);

  return (
    <PremiumWeatherCard condition={display.theme}>
      <Box sx={{ p: 3, pb: 0, position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>PARTUR, MAHARASHTRA</Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2, mt: 1 }}>
        {display.icon}
        <Typography variant="h1" fontWeight="bold" sx={{ mt: 1, color: '#ffffff', textShadow: '0 4px 15px rgba(0,0,0,0.2)', letterSpacing: '-2px', fontSize: '4.5rem', lineHeight: 1 }}>
          {weather ? `${weather.temp}°` : '--°'}
        </Typography>
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 500, letterSpacing: 1, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
          {display.label}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', zIndex: 2, mt: 2 }}>
        
        <Box sx={{ width: '100%', height: height, px: 3, display: 'flex', justifyContent: 'center' }}>
          <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
            <line x1="0" y1={horizonY} x2={width} y2={horizonY} stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
            <path d={`M 0,${horizonY} Q ${width/2},${horizonY - (amplitude * 2)} ${width},${horizonY}`} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
            {weather && weather.isDay && (
               <g>
                 <circle cx={sunX} cy={sunY} r="8" fill="rgba(255, 255, 255, 0.3)" filter="blur(4px)" />
                 <circle cx={sunX} cy={sunY} r="4" fill="#ffffff" />
               </g>
            )}
          </svg>
        </Box>

        <Stack direction="row" justifyContent="space-between" sx={{ px: 3, mb: 1 }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Sunrise {weather?.sunrise}</Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Sunset {weather?.sunset}</Typography>
        </Stack>

        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1.5} sx={{ pt: 1.5, pb: 2 }}>
           <Air fontSize="small" sx={{ color: 'rgba(255,255,255,0.9)' }} />
           <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Wind: {weather ? `${weather.wind} km/h` : '--'}</Typography>
        </Stack>

      </Box>
    </PremiumWeatherCard>
  );
};

// --- Live Power Factor Component ---
const PfItem = ({ label, value, color }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ bgcolor: 'background.default', py: 1.2, px: 1.5, borderRadius: 2, borderLeft: '4px solid', borderColor: color, boxShadow: `inset 0 -10px 20px -10px ${alpha(color, 0.1)}` }}>
    <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing={1}>{label}</Typography>
    <Typography variant="subtitle1" fontWeight="bold" sx={{ color }}>{formatValue(value)}</Typography>
  </Stack>
);

const LivePowerFactor = ({ data }) => {
  const pfSys = parseFloat(data?.power_factor ?? 0);
  const pfPercent = Math.min(Math.max(Math.abs(pfSys) * 100, 0), 100);

  return (
    <Card sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" mb={2}>
        <Typography variant="subtitle1" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>Live PF Analysis</Typography>
        <Speed color="success" />
      </Stack>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 0.5, flex: 1, alignItems: 'center' }}>
        <Box sx={{ 
          position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', 
          borderRadius: '50%', 
          background: `conic-gradient(#10b981 ${pfPercent}%, #334155 0)`, 
          '&::after': { content: '""', position: 'absolute', width: 'calc(100% - 12px)', height: 'calc(100% - 12px)', bgcolor: 'background.paper', borderRadius: '50%' } 
        }}>
          <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary', textShadow: '0 0 15px rgba(255,255,255,0.4)', letterSpacing: '-0.5px' }}>
              {formatValue(pfSys)}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={700} letterSpacing={1} sx={{ display: 'block', mt: -0.5, fontSize: '0.6rem' }}>AVG</Typography>
          </Box>
        </Box>
      </Box>
      
      <Stack spacing={1} mt="auto">
        <PfItem label="PHASE (R)" value={data?.pf_r} color="#ef4444" />
        <PfItem label="PHASE (Y)" value={data?.pf_y} color="#f59e0b" />
        <PfItem label="PHASE (B)" value={data?.pf_b} color="#3b82f6" />
      </Stack>
    </Card>
  );
};


const EnergyBox = ({ title, value, unit, color }) => (
  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 1.5, borderRadius: 2, textAlign: 'center', bgcolor: alpha(color, 0.08), border: `1px solid ${alpha(color, 0.4)}` }}>
    <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing={1} mb={0.5} textTransform="uppercase">{title}</Typography>
    <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary', mb: 0 }}>{value}</Typography>
    <Typography variant="body2" color="text.secondary">{unit}</Typography>
  </Box>
);

const TotalEnergy = ({ data }) => (
  <Card sx={{ p: 3, height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
    <Stack direction="row" justifyContent="space-between" mb={2}>
      <Typography variant="subtitle1" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>Total Energy</Typography>
      <TrendingUp color="primary" />
    </Stack>
    <Stack spacing={1.5} sx={{ flex: 1, height: '100%' }}>
      <EnergyBox title="kWh Import" value={formatEnergyCustom(data?.kwh_import, 1000)} unit="kWh" color="#3b82f6" />
      <EnergyBox title="kWh Export" value={formatEnergyCustom(data?.kwh_export, 1000)} unit="kWh" color="#3b82f6" />
      <EnergyBox title="kVAh Import" value={formatEnergyCustom(data?.kvah_import, 1000)} unit="kVAh" color="#06b6d4" />
      <EnergyBox title="kVAh Export" value={formatEnergyCustom(data?.kvah_export, 1000)} unit="kVAh" color="#06b6d4" />
      <EnergyBox title="kVArh Import" value={formatEnergyCustom(data?.kvarh_import, 10)} unit="kVArh" color="#a855f7" />
      <EnergyBox title="kVArh Export" value={formatEnergyCustom(data?.kvarh_export, 100)} unit="kVArh" color="#a855f7" />
    </Stack>
  </Card>
);

// ==========================================
// 4. MAIN DASHBOARD LAYOUT & SOCKET LISTENER
// ==========================================
const Dashboard = () => {
  const [liveData, setLiveData] = useState(null);
  
  // MODAL STATE FOR SECURITY LOGOUT
  const [logoutCountdown, setLogoutCountdown] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Background Credentials Polling
  useEffect(() => {
    const checkCredentials = async () => {
      try {
        const token = localStorage.getItem('token');
        const localUsername = localStorage.getItem('company_username') || localStorage.getItem('username'); 
        
        // If not logged in, no need to check
        if (!token || !localUsername) return;

        const response = await fetch('https://ipqsoms.com/api/companies/TatapowerLtd.', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const fetchedUsername = data?.company?.company_username;

          // If the username in DB does not match the one stored locally:
          if (fetchedUsername && fetchedUsername !== localUsername) {
            setShowLogoutModal(true);
            setLogoutCountdown(10); // Start 10 second countdown
          }
        }
      } catch (error) {
        console.error("Error verifying credentials:", error);
      }
    };

    // Check immediately, then every 60 seconds
    checkCredentials();
    const intervalId = setInterval(checkCredentials, 60000);

    return () => clearInterval(intervalId);
  }, []);

  // Handle Logout Countdown logic
  useEffect(() => {
    if (logoutCountdown === null) return;

    if (logoutCountdown > 0) {
      const timer = setTimeout(() => setLogoutCountdown(logoutCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (logoutCountdown === 0) {
      // Time is up! Kick user out.
      socket.disconnect();
      localStorage.clear();
      window.location.href = '/login';
    }
  }, [logoutCountdown]);

  useEffect(() => {
    const deviceId = "DEV122240";
    const eventName = `device-data-${deviceId}`;
    socket.on('connect', () => console.log('✅ Socket connected!'));
    socket.on('connect_error', (err) => console.error('❌ Socket connection error:', err));

    const handleData = (incoming) => {
      let parsedData = incoming;
      if (typeof incoming === 'string') {
        try { parsedData = JSON.parse(incoming); } catch (error) { return; }
      }
      let flatData = { ...parsedData };
      if (parsedData && parsedData.data && typeof parsedData.data === 'object') {
         flatData = { ...parsedData, ...parsedData.data };
      }
      let normalizedData = {};
      if (flatData) {
         Object.keys(flatData).forEach(key => { normalizedData[key.toLowerCase()] = flatData[key]; });
      }
      if (normalizedData.powerfactor !== undefined && normalizedData.power_factor === undefined) {
         normalizedData.power_factor = normalizedData.powerfactor;
      }
      if (normalizedData.kvarhlag !== undefined && normalizedData.kvarh === undefined) {
         normalizedData.kvarh = normalizedData.kvarhlag;
      }
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
    <Box sx={{ minHeight: '100vh', width: '100%', p: { xs: 1.5, md: 3 }, backgroundImage: `linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)`, backgroundSize: '30px 30px' }}>
      <Header liveData={liveData} />
      
      <Grid container spacing={3} sx={{ width: '100%', margin: 0, alignItems: 'stretch' }}>
        
        {/* LEFT COLUMN: Main Phase Electrical Parameters */}
        <Grid size={{ xs: 12, lg: 7.8 }} sx={{ display: 'flex' }}>
          <PhaseParameters data={liveData} />
        </Grid>
        
        {/* MIDDLE COLUMN: Weather Widget & Live Power Factor Stacked */}
        <Grid size={{ xs: 12, md: 6, lg: 2.2 }} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <WeatherWidget />
          <LivePowerFactor data={liveData} />
        </Grid>
        
        {/* RIGHT COLUMN: Total Energy */}
        <Grid size={{ xs: 12, md: 6, lg: 2 }} sx={{ display: 'flex' }}>
          <TotalEnergy data={liveData} />
        </Grid>

      </Grid>

      {/* SECURITY LOGOUT MODAL */}
      <Dialog 
        open={showLogoutModal} 
        disableEscapeKeyDown
        onClose={(event, reason) => {
          // Prevent closing by clicking outside the modal or pressing Esc
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            setShowLogoutModal(false);
          }
        }}
        PaperProps={{ 
          sx: { 
            bgcolor: 'background.paper', 
            borderRadius: 3, 
            border: '2px solid #ef4444', 
            minWidth: { xs: '90%', sm: '400px' }, 
            textAlign: 'center', 
            p: 4,
            boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)'
          } 
        }}
      >
        <Typography variant="h5" color="error.main" fontWeight="bold" mb={2}>
          Security Alert
        </Typography>
        <Typography variant="body1" color="text.primary" mb={3} sx={{ fontSize: '1.1rem' }}>
          Your account credentials have been changed from another session. For your security, you are being automatically logged out.
        </Typography>
        <Typography variant="h1" color="error.main" fontWeight="bold" mb={1} sx={{ fontSize: '5rem', lineHeight: 1 }}>
          {logoutCountdown}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>
          Seconds Remaining
        </Typography>
      </Dialog>
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