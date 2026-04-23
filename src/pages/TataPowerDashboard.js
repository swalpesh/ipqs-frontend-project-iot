import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { 
  Box, Grid, Stack, Card, Typography, Table, TableBody, 
  TableCell, TableHead, TableRow, Select, MenuItem, Button, IconButton, 
  ThemeProvider, CssBaseline, createTheme, Menu, Divider
} from '@mui/material';
import { alpha, keyframes, styled } from '@mui/material/styles';
import { 
  SignalCellularAlt, ElectricalServices, TrendingUp, BarChart, 
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

const shiftGradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
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
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: bgGradient,
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: 'inset 0 0 60px rgba(0,0,0,0.2)', 
    position: 'relative',
    overflow: 'hidden'
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
      </Menu>
    </Box>
  );
};

const MetricBox = ({ title, value, unit, color }) => (
  <Box sx={{ p: 2.5, borderRadius: 2, textAlign: 'center', bgcolor: alpha(color, 0.1), border: `1px solid ${color}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
    <Typography variant="h6" color="text.secondary" fontWeight={600} display="block" mb={1} sx={{ fontSize: '1.05rem', whiteSpace: 'nowrap' }}>{title}</Typography>
    <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ mb: 0.5 }}>{value}</Typography>
    <Typography variant="body1" color="text.secondary" fontWeight={600}>{unit}</Typography>
  </Box>
);

const PhaseParameters = ({ data }) => (
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

const WeatherWidget = () => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=19.5933&longitude=76.2139&current=temperature_2m,is_day,weather_code,wind_speed_10m&daily=sunrise,sunset,weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata');
        const data = await response.json();
        
        let forecastList = [];
        if (data && data.daily && data.daily.time) {
           forecastList = data.daily.time.map((time, index) => ({
             date: index === 0 ? 'Today' : new Date(time).toLocaleDateString('en-US', { weekday: 'short' }),
             code: data.daily.weather_code[index],
             max: Math.round(data.daily.temperature_2m_max[index]),
             min: Math.round(data.daily.temperature_2m_min[index]),
           }));
        }

        setWeather({
          temp: Math.round(data.current.temperature_2m),
          isDay: data.current.is_day,
          code: data.current.weather_code,
          wind: data.current.wind_speed_10m,
          sunriseTime: data.daily.sunrise[0], 
          sunsetTime: data.daily.sunset[0],
          sunrise: new Date(data.daily.sunrise[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          sunset: new Date(data.daily.sunset[0]).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          forecast: forecastList,
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

  const getSmallIcon = (code) => {
    if (code === 0) return <WbSunny sx={{ fontSize: 22, color: '#fde047' }} />;
    if (code <= 48) return <CloudQueue sx={{ fontSize: 22, color: '#cbd5e1' }} />;
    if (code <= 67 || (code >= 80 && code <= 82)) return <Opacity sx={{ fontSize: 22, color: '#93c5fd' }} />;
    if (code >= 95) return <Thunderstorm sx={{ fontSize: 22, color: '#cbd5e1' }} />;
    return <WbSunny sx={{ fontSize: 22, color: '#fde047' }} />;
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
        <Typography variant="subtitle1" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, letterSpacing: 2 }}>EAKRUKHA</Typography>
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

        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1.5} sx={{ borderBottom: '1px solid rgba(255,255,255,0.15)', pb: 1.5 }}>
           <Air fontSize="small" sx={{ color: 'rgba(255,255,255,0.9)' }} />
           <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>Wind: {weather ? `${weather.wind} km/h` : '--'}</Typography>
        </Stack>

        <Box sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          minHeight: '160px', 
          px: 3, 
          pt: 1, 
          pb: 2,
          '&::-webkit-scrollbar': { display: 'none' }, 
          msOverflowStyle: 'none', 
          scrollbarWidth: 'none' 
        }}>
          {weather?.forecast?.map((day, index) => (
            <Stack key={index} direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1, borderBottom: index < 6 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
              <Typography variant="body2" sx={{ color: 'white', width: '45px', fontWeight: index === 0 ? 700 : 500, fontSize: '0.9rem' }}>
                {day.date}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px' }}>
                {getSmallIcon(day.code)}
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', width: '25px', textAlign: 'right', fontWeight: 600, fontSize: '0.9rem' }}>
                {day.min}°
              </Typography>
              <Box sx={{ flex: 1, mx: 1.5, height: '4px', borderRadius: 2, background: 'rgba(0,0,0,0.3)', position: 'relative', overflow: 'hidden' }}>
                 <Box sx={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', background: 'linear-gradient(90deg, #60a5fa, #fde047, #f97316)' }} />
              </Box>
              <Typography variant="body2" sx={{ color: 'white', width: '25px', textAlign: 'left', fontWeight: 700, fontSize: '0.9rem' }}>
                {day.max}°
              </Typography>
            </Stack>
          ))}
        </Box>
      </Box>
    </PremiumWeatherCard>
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
  <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
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

// --- REDESIGNED LIVE POWER FACTOR COMPONENT ---
const LivePowerFactor = ({ data }) => {
  return (
    <Card sx={{ p: 3, mt: 3 }}>
      <Stack direction="row" justifyContent="space-between" mb={3}>
        <Typography variant="subtitle1" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>Live Power Factor Analysis</Typography>
        <Speed color="success" />
      </Stack>
      
      <Grid container spacing={4} alignItems="center">
        {/* Animated 3-Phase Fusion Ring */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ position: 'relative', width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* Inner track */}
            <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: 'absolute', top: 0, left: 0 }}>
              <circle cx="90" cy="90" r="75" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            </svg>

            {/* Spinning Colored Phase Segments */}
            <svg width="180" height="180" viewBox="0 0 180 180" style={{ position: 'absolute', top: 0, left: 0, animation: `${spin} 10s linear infinite` }}>
              <defs>
                <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Math: 2 * PI * 75 radius = 471.2 circumference. Dashes split evenly into 3. */}
              {/* R Phase - Red */}
              <circle cx="90" cy="90" r="75" fill="none" stroke="#ef4444" strokeWidth="8" strokeDasharray="130 341.2" strokeDashoffset="0" strokeLinecap="round" filter="url(#neonGlow)" />
              {/* Y Phase - Yellow */}
              <circle cx="90" cy="90" r="75" fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray="130 341.2" strokeDashoffset="-157" strokeLinecap="round" filter="url(#neonGlow)" />
              {/* B Phase - Blue */}
              <circle cx="90" cy="90" r="75" fill="none" stroke="#3b82f6" strokeWidth="8" strokeDasharray="130 341.2" strokeDashoffset="-314" strokeLinecap="round" filter="url(#neonGlow)" />
            </svg>

            <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
              <Typography variant="h3" fontWeight="bold" sx={{ color: 'text.primary', textShadow: '0 2px 10px rgba(255,255,255,0.2)' }}>
                {formatValue(data?.power_factor)}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing={1}>SYSTEM AVG</Typography>
            </Box>
          </Box>
        </Grid>
        
        {/* Phases Side-by-Side */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 2, borderBottom: '5px solid', borderColor: 'error.main', textAlign: 'center', boxShadow: 'inset 0 -10px 20px -10px rgba(239,68,68,0.1)' }}>
                 <Typography variant="body2" color="text.secondary" fontWeight={600} letterSpacing={1} mb={1}>PHASE 1 (R)</Typography>
                 <Typography variant="h3" fontWeight="bold" color="error.main">{formatValue(data?.pf_r)}</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 2, borderBottom: '5px solid', borderColor: 'warning.main', textAlign: 'center', boxShadow: 'inset 0 -10px 20px -10px rgba(245,158,11,0.1)' }}>
                 <Typography variant="body2" color="text.secondary" fontWeight={600} letterSpacing={1} mb={1}>PHASE 2 (Y)</Typography>
                 <Typography variant="h3" fontWeight="bold" color="warning.main">{formatValue(data?.pf_y)}</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 2, borderBottom: '5px solid', borderColor: 'primary.main', textAlign: 'center', boxShadow: 'inset 0 -10px 20px -10px rgba(59,130,246,0.1)' }}>
                 <Typography variant="body2" color="text.secondary" fontWeight={600} letterSpacing={1} mb={1}>PHASE 3 (B)</Typography>
                 <Typography variant="h3" fontWeight="bold" color="primary.main">{formatValue(data?.pf_b)}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
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
      <Grid container spacing={3} sx={{ width: '100%', margin: 0 }}>
        <Grid size={{ xs: 12, lg: 7.8 }}><PhaseParameters data={liveData} /></Grid>
        <Grid size={{ xs: 12, md: 6, lg: 2.2 }}>
          <WeatherWidget />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 2 }}><TotalEnergy data={liveData} /></Grid>
      </Grid>
      <LivePowerFactor data={liveData} />
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