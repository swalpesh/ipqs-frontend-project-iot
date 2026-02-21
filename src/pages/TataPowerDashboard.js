import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Grid, Stack, Card, Typography, Table, TableBody, 
  TableCell, TableHead, TableRow, Tabs, Tab, Button, IconButton, 
  ThemeProvider, CssBaseline, createTheme, Menu, Divider, Select, MenuItem
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { 
  Bolt, SignalCellularAlt, ElectricalServices, Speed, TrendingUp, 
  CallMade, BarChart, Download, Circle, Logout, KeyboardArrowDown
} from '@mui/icons-material';

// ==========================================
// 1. THEME DEFINITION
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
// 2. INDIVIDUAL WIDGET COMPONENTS
// ==========================================

const Header = () => {
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

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.paper', p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 2, mb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Bolt color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h5" fontWeight="bold">TataPower</Typography>
      </Stack>
      
      <Typography variant="subtitle1" fontWeight={600} letterSpacing={2} color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
        ENERGY MONITORING DASHBOARD
      </Typography>
      
      <Stack direction="row" alignItems="center" spacing={3}>
        <Box>
          <Button
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              bgcolor: 'background.default', borderRadius: '20px', px: 2, py: 0.5,
              textTransform: 'none', color: 'text.primary', border: '1px solid', borderColor: 'divider',
              '&:hover': { bgcolor: alpha('#334155', 0.8) }
            }}
            startIcon={<Circle sx={{ color: 'success.main', fontSize: '12px !important' }} />}
            endIcon={<KeyboardArrowDown sx={{ color: 'text.secondary' }} />}
          >
            <Typography fontWeight="bold">Active</Typography>
          </Button>

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
              <Typography variant="body2" fontFamily="monospace" color="primary.main" fontWeight="bold">DEV-8X92-PWR</Typography>
            </Box>
          </Menu>
        </Box>

        <Stack direction="row" alignItems="center" spacing={1} color="success.main">
          <SignalCellularAlt />
          <Typography fontWeight="bold">CONNECTED</Typography>
        </Stack>

        <Box textAlign="right" sx={{ minWidth: 120 }}>
          <Typography variant="body1" fontWeight="bold">{timeString}</Typography>
          <Typography variant="caption" color="text.secondary">{dateString}</Typography>
        </Box>
        
        <Button variant="outlined" color="error" size="small" endIcon={<Logout />} onClick={handleLogout} sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}>
          Logout
        </Button>
      </Stack>
    </Box>
  );
};

const MetricBox = ({ title, value, unit, color }) => (
  <Box sx={{ p: 1.5, borderRadius: 2, textAlign: 'center', bgcolor: alpha(color, 0.1), border: `1px solid ${color}` }}>
    <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>{title}</Typography>
    <Typography variant="h5" fontWeight="bold" color="text.primary">{value} <Typography component="span" variant="body2" color="text.secondary">{unit}</Typography></Typography>
  </Box>
);

const PhaseParameters = () => (
  <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Stack direction="row" justifyContent="space-between" mb={3}>
      <Typography variant="subtitle1" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>Phase Electrical Parameters</Typography>
      <ElectricalServices color="warning" />
    </Stack>
    <Grid container spacing={1.5} mb={3}>
      <Grid item xs={12} sm={2.4}><MetricBox title="AVG VOLTAGE" value="415" unit="V" color="#3b82f6" /></Grid>
      <Grid item xs={12} sm={2.4}><MetricBox title="AVG CURRENT" value="120" unit="A" color="#10b981" /></Grid>
      <Grid item xs={12} sm={2.4}><MetricBox title="ACTIVE PWR" value="450.5" unit="kW" color="#f59e0b" /></Grid>
      <Grid item xs={12} sm={2.4}><MetricBox title="REACTIVE PWR" value="149.8" unit="kVAr" color="#a855f7" /></Grid>
      <Grid item xs={12} sm={2.4}><MetricBox title="APPARENT PWR" value="474.7" unit="kVA" color="#06b6d4" /></Grid>
    </Grid>
    <Box sx={{ overflowX: 'auto', mt: 'auto' }}>
      <Table sx={{ minWidth: 500, borderSpacing: '0 15px', borderCollapse: 'separate' }}>
        <TableHead>
          <TableRow>
            {['Voltage (V)', 'Current (A)', 'Active Pwr (kW)', 'Reactive (kVAr)', 'Apparent (kVA)'].map((head) => (
              <TableCell key={head} align="center" sx={{ color: 'text.secondary', fontWeight: 600, borderBottom: 'none', py: 0 }}>
                {head.split(' ')[0]} <br/> <Typography variant="caption" fontWeight={400}>{head.split(' ')[1]}</Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {[
            { v: 240, i: 118, kw: 150.2, kvar: 50.1, kva: 158.3, color: '#ef4444' },
            { v: 238, i: 115, kw: 148.9, kvar: 48.5, kva: 156.6, color: '#f59e0b' },
            { v: 242, i: 122, kw: 151.4, kvar: 51.2, kva: 159.8, color: '#3b82f6' },
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

const PfItem = ({ label, value, color }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ bgcolor: 'background.default', p: 2, borderRadius: 2, borderLeft: '5px solid', borderColor: color }}>
    <Typography variant="body2" color="text.secondary" fontWeight={600} letterSpacing={1}>{label}</Typography>
    <Typography variant="h6" fontWeight="bold" sx={{ color }}>{value}</Typography>
  </Stack>
);

const SystemPowerFactor = () => (
  <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Stack direction="row" justifyContent="space-between" mb={3}>
      <Typography variant="subtitle1" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>System Power Factor</Typography>
      <Speed color="success" />
    </Stack>
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 'auto', py: 2 }}>
      <Box sx={{ width: 180, height: 180, borderRadius: '50%', background: 'conic-gradient(#10b981 98%, #334155 0)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', '&::after': { content: '""', position: 'absolute', width: 'calc(100% - 20px)', height: 'calc(100% - 20px)', bgcolor: 'background.paper', borderRadius: '50%' } }}>
        <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <Typography variant="h3" fontWeight="bold">0.980</Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing={1}>SYSTEM PF</Typography>
        </Box>
      </Box>
    </Box>
    <Stack spacing={1.5} mt={2}>
      <PfItem label="PHASE 1 (R)" value="0.970" color="error.main" />
      <PfItem label="PHASE 2 (Y)" value="0.990" color="warning.main" />
      <PfItem label="PHASE 3 (B)" value="0.920" color="primary.main" />
    </Stack>
  </Card>
);

const EnergyBox = ({ title, value, unit, color, trend }) => (
  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 2.5, borderRadius: 2, textAlign: 'center', bgcolor: alpha(color, 0.08), border: `1px solid ${alpha(color, 0.4)}` }}>
    <Typography variant="body2" color="text.secondary" fontWeight={600} letterSpacing={1} mb={1}>{title}</Typography>
    <Typography variant="h3" fontWeight="bold">{value} <Typography component="span" variant="subtitle1" color="text.secondary">{unit}</Typography></Typography>
    {trend && <Typography variant="body2" color="success.main" mt={1} display="flex" alignItems="center" justifyContent="center" gap={0.5}><CallMade fontSize="small" /> {trend}</Typography>}
  </Box>
);

const TotalEnergy = () => (
  <Card sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Stack direction="row" justifyContent="space-between" mb={3}>
      <Typography variant="subtitle1" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>Total Energy</Typography>
      <TrendingUp color="primary" />
    </Stack>
    <Stack spacing={2.5} sx={{ flex: 1, height: '100%' }}>
      <EnergyBox title="ACTIVE ENERGY" value="12,450.82" unit="kWh" color="#3b82f6" trend="+ 2.4%" />
      <EnergyBox title="APPARENT ENERGY" value="13,100" unit="kVAh" color="#06b6d4" />
      <EnergyBox title="REACTIVE ENERGY" value="2,400" unit="kVArh" color="#a855f7" />
    </Stack>
  </Card>
);

const MonthlyAnalysis = () => {
  const [selectedYear, setSelectedYear] = useState('2026');

  const yearlyData = {
    '2024': [
      { month: 'Jan', val: '0.940', height: '30%' }, { month: 'Feb', val: '0.945', height: '35%' },
      { month: 'Mar', val: '0.950', height: '40%' }, { month: 'Apr', val: '0.955', height: '45%' },
      { month: 'May', val: '0.960', height: '50%' }, { month: 'Jun', val: '0.965', height: '55%' },
      { month: 'Jul', val: '0.962', height: '52%' }, { month: 'Aug', val: '0.970', height: '60%' },
      { month: 'Sep', val: '0.975', height: '65%' }, { month: 'Oct', val: '0.980', height: '70%' },
      { month: 'Nov', val: '0.985', height: '75%' }, { month: 'Dec', val: '0.990', height: '80%', highlight: true },
    ],
    '2025': [
      { month: 'Jan', val: '0.955', height: '38%' }, { month: 'Feb', val: '0.962', height: '45%' },
      { month: 'Mar', val: '0.968', height: '52%' }, { month: 'Apr', val: '0.976', height: '60%' },
      { month: 'May', val: '0.980', height: '65%' }, { month: 'Jun', val: '0.985', height: '72%' },
      { month: 'Jul', val: '0.982', height: '68%' }, { month: 'Aug', val: '0.988', height: '76%' },
      { month: 'Sep', val: '0.992', height: '84%' }, { month: 'Oct', val: '0.995', height: '89%' },
      { month: 'Nov', val: '0.997', height: '94%' }, { month: 'Dec', val: '0.999', height: '98%', highlight: true },
    ],
    '2026': [
      { month: 'Jan', val: '0.965', height: '48%' }, { month: 'Feb', val: '0.970', height: '55%' },
      { month: 'Mar', val: '0.975', height: '60%' }, { month: 'Apr', val: '0.982', height: '68%' },
      { month: 'May', val: '0.985', height: '72%' }, { month: 'Jun', val: '0.988', height: '78%' },
      { month: 'Jul', val: '0.986', height: '75%' }, { month: 'Aug', val: '0.992', height: '85%' },
      { month: 'Sep', val: '0.995', height: '90%' }, { month: 'Oct', val: '0.998', height: '95%' },
      { month: 'Nov', val: '0.999', height: '98%' }, { month: 'Dec', val: '1.000', height: '100%', highlight: true },
    ]
  };

  const chartData = yearlyData[selectedYear];

  return (
    <Card sx={{ p: 3, mt: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Typography variant="h6" fontWeight="bold">Monthly Power Factor Analysis</Typography>
          <Typography variant="caption" color="text.secondary">Efficiency tracking Jan - Dec</Typography>
        </Box>
        <Stack direction="row" spacing={3} alignItems="center">
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
          <Typography variant="body2" color="primary.main" display="flex" alignItems="center" gap={1}><BarChart fontSize="small" /> PF Trend</Typography>
          <Typography variant="body2" color="success.main">— 0.950 Threshold</Typography>
        </Stack>
      </Stack>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: 220, position: 'relative', pb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
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

// ==========================================
// 4. UPDATED: REAL-TIME PARAMETERS GRAPH
// ==========================================
const RealTimeParameters = () => {
  const [tab, setTab] = useState(0);
  
  // State for the Parameters Dropdown Filter
  const [paramFilter, setParamFilter] = useState('All');
  const [anchorElParam, setAnchorElParam] = useState(null);
  const openParam = Boolean(anchorElParam);

  // Hardcoded line generation data for demonstration purposes
  const graphData = {
    0: { // Today
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
      paths: {
        Voltage: { color: '#f59e0b', d: "M0,40 Q300,35 700,50 T1400,45" },
        kWh:     { color: '#3b82f6', d: "M0,80 Q250,60 500,90 T1000,75 T1400,85" },
        Current: { color: '#ef4444', d: "M0,110 Q400,125 700,105 T1400,115" },
        kVArh:   { color: '#10b981', d: "M0,135 Q300,130 600,140 T1000,135 T1400,140" },
      }
    },
    1: { // Weekly
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      paths: {
        Voltage: { color: '#f59e0b', d: "M0,50 Q300,60 700,40 T1400,55" },
        kWh:     { color: '#3b82f6', d: "M0,90 Q200,110 400,70 T800,80 T1400,60" },
        Current: { color: '#ef4444', d: "M0,120 Q400,100 700,115 T1400,110" },
        kVArh:   { color: '#10b981', d: "M0,140 Q300,135 600,145 T1000,135 T1400,145" },
      }
    },
    2: { // Monthly
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
      paths: {
        Voltage: { color: '#f59e0b', d: "M0,45 Q350,30 700,55 T1400,40" },
        kWh:     { color: '#3b82f6', d: "M0,75 Q350,95 700,65 T1400,80" },
        Current: { color: '#ef4444', d: "M0,105 Q350,120 700,100 T1400,125" },
        kVArh:   { color: '#10b981', d: "M0,130 Q350,145 700,135 T1400,140" },
      }
    },
    3: { // Yearly
      labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov', 'Dec'],
      paths: {
        Voltage: { color: '#f59e0b', d: "M0,35 Q300,50 700,30 T1400,45" },
        kWh:     { color: '#3b82f6', d: "M0,65 Q250,85 600,60 T1000,90 T1400,70" },
        Current: { color: '#ef4444', d: "M0,115 Q400,105 700,125 T1400,100" },
        kVArh:   { color: '#10b981', d: "M0,145 Q300,130 600,140 T1000,135 T1400,140" },
      }
    }
  };

  const currentGraph = graphData[tab];

  const handleParamClick = (event) => setAnchorElParam(event.currentTarget);
  const handleParamSelect = (value) => {
    setParamFilter(value);
    setAnchorElParam(null);
  };

  return (
    <Card sx={{ p: 3, mt: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" borderBottom="1px solid" borderColor="divider" pb={1} mb={3}>
        
        {/* Time Span Tabs */}
        <Tabs value={tab} onChange={(e, v) => setTab(v)} textColor="primary" indicatorColor="primary">
          <Tab label="Today" sx={{ textTransform: 'none', fontWeight: 500 }} />
          <Tab label="Weekly" sx={{ textTransform: 'none', fontWeight: 500 }} />
          <Tab label="Monthly" sx={{ textTransform: 'none', fontWeight: 500 }} />
          <Tab label="Yearly" sx={{ textTransform: 'none', fontWeight: 500 }} />
        </Tabs>

        <Stack direction="row" spacing={1}>
          {/* NEW: Parameters Dropdown */}
          <Button 
            variant="outlined" 
            color="inherit" 
            onClick={handleParamClick}
            endIcon={<KeyboardArrowDown />}
            sx={{ color: 'text.secondary', borderColor: 'divider', textTransform: 'none' }}
          >
            {paramFilter === 'All' ? 'Parameters' : paramFilter}
          </Button>
          
          <Menu anchorEl={anchorElParam} open={openParam} onClose={() => setAnchorElParam(null)}>
            {['All', 'kWh', 'kVArh', 'Voltage', 'Current'].map(opt => (
              <MenuItem key={opt} onClick={() => handleParamSelect(opt)}>{opt}</MenuItem>
            ))}
          </Menu>

          <IconButton sx={{ bgcolor: 'divider', color: 'white', borderRadius: 1 }}><Download fontSize="small" /></IconButton>
        </Stack>
      </Stack>
      
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle2" fontWeight="bold" textTransform="uppercase" letterSpacing={1}>REAL-TIME PARAMETERS</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          {[{l: 'kWh', c: 'primary.main'}, {l: 'kVArh', c: 'success.main'}, {l: 'Voltage', c: 'warning.main'}, {l: 'Current', c: 'error.main'}].map(item => (
            <Typography key={item.l} variant="caption" color={item.c} display="flex" alignItems="center" gap={0.5}>
              <Circle sx={{ fontSize: 8 }} /> {item.l}
            </Typography>
          ))}
        </Stack>
      </Stack>
      
      {/* SVG Graph rendering matching paths with colors and handling filters */}
      <Box sx={{ height: 180, borderLeft: '1px solid', borderBottom: '1px solid', borderColor: 'divider', mt: 2 }}>
        <svg width="100%" height="100%" viewBox="0 0 1400 150" preserveAspectRatio="none">
          {Object.keys(currentGraph.paths).map(key => {
            // Hide path if it doesn't match the selected filter (and filter isn't 'All')
            if (paramFilter !== 'All' && paramFilter !== key) return null;
            
            return (
              <path 
                key={key} 
                d={currentGraph.paths[key].d} 
                fill="none" 
                stroke={currentGraph.paths[key].color} 
                strokeWidth="2.5"
                style={{ transition: 'd 0.5s ease-in-out, stroke-opacity 0.3s' }} // Smooth transition between tabs
              />
            )
          })}
        </svg>
      </Box>

      {/* Dynamic X-Axis Labels based on Tab */}
      <Stack direction="row" justifyContent="space-between" mt={1} pl={1}>
        {currentGraph.labels.map(t => (
          <Typography key={t} variant="caption" color="text.secondary">{t}</Typography>
        ))}
      </Stack>
      
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} mt={4}>
        <Box flex={1}><SummaryBox title="Daily Summary" energy={{ val: '450', unit: 'kWh' }} pf="0.98" progress="70%" /></Box>
        <Box flex={1}><SummaryBox title="Monthly Summary" energy={{ val: '12,450', unit: 'kWh' }} pf="0.96" progress="85%" /></Box>
        <Box flex={1}><SummaryBox title="Yearly Summary" energy={{ val: '1.4', unit: 'MWh' }} pf="0.95" progress="95%" /></Box>
      </Stack>
    </Card>
  );
};

// ==========================================
// 5. MAIN DASHBOARD LAYOUT
// ==========================================
const Dashboard = () => (
  <Box
    sx={{
      minHeight: '100vh', width: '100%', p: 3,
      backgroundImage: `linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)`,
      backgroundSize: '30px 30px'
    }}
  >
    <Header />

    <Grid container spacing={3} sx={{ width: '100%', margin: 0 }}>
      <Grid item xs={12} lg={7}><PhaseParameters /></Grid>
      <Grid item xs={12} md={6} lg={3}><SystemPowerFactor /></Grid>
      <Grid item xs={12} md={6} lg={2}><TotalEnergy /></Grid>
    </Grid>

    <MonthlyAnalysis />
    <RealTimeParameters />
  </Box>
);

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