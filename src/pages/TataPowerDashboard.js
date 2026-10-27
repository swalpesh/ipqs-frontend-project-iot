import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// Import Logos (Ensure these paths match your project structure)
import tataLogo from '../assets/tata_power.png';
import ipqsLogo from '../assets/logo.png';

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

// |PF| as a 0–100 percentage, used for the gauge ring and per-phase bars
const pfPercent = (val) => {
  const num = Math.abs(parseFloat(val));
  return isNaN(num) ? 0 : Math.min(num, 1) * 100;
};

// ==========================================
// 2. STATIC CONFIG
// ==========================================

// Power-factor quality thresholds (on |PF|). Adjust to your plant's targets.
const PF_GOOD = 0.95;
const PF_FAIR = 0.85;

const PHASES = [
  { key: 'r', name: 'R', color: '#fb7185', soft: 'rgba(251, 113, 133, 0.12)' },
  { key: 'y', name: 'Y', color: '#fbbf24', soft: 'rgba(251, 191, 36, 0.12)' },
  { key: 'b', name: 'B', color: '#60a5fa', soft: 'rgba(96, 165, 250, 0.12)' },
];

const PHASE_METRICS = [
  { label: 'Voltage',  unit: 'kV',   field: 'voltage', fmt: formatVoltage },
  { label: 'Current',  unit: 'A',    field: 'current', fmt: formatValue },
  { label: 'Active',   unit: 'MW',   field: 'kw',      fmt: formatValue },
  { label: 'Apparent', unit: 'kVA',  field: 'kva',     fmt: formatValue },
  { label: 'Reactive', unit: 'kVAr', field: 'kvar',    fmt: formatValue },
];

const AVERAGE_METRICS = [
  { label: 'Average Voltage',  unit: 'kV',   field: 'voltage', fmt: formatVoltage },
  { label: 'Average Current',  unit: 'A',    field: 'current', fmt: formatValue },
  { label: 'Average Active',   unit: 'MW',   field: 'kw',      fmt: formatValue },
  { label: 'Average Reactive', unit: 'MVAr', field: 'kvar',    fmt: formatValue },
  { label: 'Average Apparent', unit: 'MVA',  field: 'kva',     fmt: formatValue },
];

const KPIS = [
  { label: 'kWh Import',   field: 'kwh_import',   divisor: 1000, unit: 'kWh',   tone: 'var(--tone-active)' },
  { label: 'kWh Export',   field: 'kwh_export',   divisor: 1000, unit: 'kWh',   tone: 'var(--tone-active)' },
  { label: 'kVAh Import',  field: 'kvah_import',  divisor: 1000, unit: 'kVAh',  tone: 'var(--tone-apparent)' },
  { label: 'kVAh Export',  field: 'kvah_export',  divisor: 1000, unit: 'kVAh',  tone: 'var(--tone-apparent)' },
  { label: 'kVArh Import', field: 'kvarh_import', divisor: 10,   unit: 'kVArh', tone: 'var(--tone-reactive)' },
  { label: 'kVArh Export', field: 'kvarh_export', divisor: 100,  unit: 'kVArh', tone: 'var(--tone-reactive)' },
];

// ==========================================
// 3. INLINE ICONS (no Font Awesome dependency)
// ==========================================
const Icon = ({ children, size = 16, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
    {children}
  </svg>
);
const GearIcon = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Icon>
);
const LogoutIcon = (p) => (
  <Icon {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Icon>
);
const WifiIcon = (p) => (
  <Icon {...p}>
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </Icon>
);
const BoltIcon = (p) => (
  <Icon {...p}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></Icon>
);
const GaugeIcon = (p) => (
  <Icon {...p}>
    <path d="M12 14l4-4" />
    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
  </Icon>
);
const PinIcon = (p) => (
  <Icon {...p}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
);

// ==========================================
// 4. MAIN COMPONENT
// ==========================================
const TataPowerDashboard = () => {
    // --- State Management ---
    const [liveData, setLiveData] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [weather, setWeather] = useState(null);

    // Modals & Auth State
    const [openCredModal, setOpenCredModal] = useState(false);
    const [logoutCountdown, setLogoutCountdown] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [formData, setFormData] = useState({
        companyId: 'TataPowerLtd.',
        username: '',
        password: '',
        securityCode: ''
    });

    // --- Hooks: Time, Weather, Security, Socket ---
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) window.location.href = '/login';

        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=19.5933&longitude=76.2139&current=temperature_2m,is_day,weather_code,wind_speed_10m&daily=sunrise,sunset&timezone=Asia%2FKolkata');
                const data = await response.json();
                setWeather({ temp: Math.round(data.current.temperature_2m) });
            } catch (error) {
                console.error('Weather fetch error:', error);
            }
        };
        fetchWeather();
        const interval = setInterval(fetchWeather, 120000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const checkCredentials = async () => {
            try {
                const token = localStorage.getItem('token');
                const localUsername = localStorage.getItem('company_username') || localStorage.getItem('username');
                if (!token || !localUsername) return;

                const response = await fetch('https://ipqsoms.com/api/companies/TatapowerLtd.', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    const fetchedUsername = data?.company?.company_username;
                    if (fetchedUsername && fetchedUsername !== localUsername) {
                        setShowLogoutModal(true);
                        setLogoutCountdown(10);
                    }
                }
            } catch (error) {
                console.error("Error verifying credentials:", error);
            }
        };
        checkCredentials();
        const intervalId = setInterval(checkCredentials, 60000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (logoutCountdown === null) return;
        if (logoutCountdown > 0) {
            const timer = setTimeout(() => setLogoutCountdown(logoutCountdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (logoutCountdown === 0) {
            socket.disconnect();
            localStorage.clear();
            window.location.href = '/login';
        }
    }, [logoutCountdown]);

    useEffect(() => {
        const deviceId = "DEV122240";
        const eventName = `device-data-${deviceId}`;

        const handleData = (incoming) => {
            let parsedData = incoming;
            if (typeof incoming === 'string') {
                try { parsedData = JSON.parse(incoming); } catch (error) { return; }
            }
            let flatData = { ...parsedData, ...(parsedData?.data || {}) };
            let normalizedData = {};
            Object.keys(flatData).forEach(key => { normalizedData[key.toLowerCase()] = flatData[key]; });

            if (normalizedData.powerfactor !== undefined && normalizedData.power_factor === undefined) {
                normalizedData.power_factor = normalizedData.powerfactor;
            }
            if (normalizedData.kvarhlag !== undefined && normalizedData.kvarh === undefined) {
                normalizedData.kvarh = normalizedData.kvarhlag;
            }
            setLiveData(normalizedData);
        };

        socket.on(eventName, handleData);
        return () => socket.off(eventName, handleData);
    }, []);

    // --- Action Handlers ---
    const handleLogout = () => {
        socket.disconnect();
        localStorage.clear();
        window.location.href = '/login';
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
                socket.disconnect();
                localStorage.clear();
                window.location.href = '/login';
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            alert("An error occurred while connecting to the server.");
        }
    };

    // --- Derived Status Variables ---
    const timeString = currentTime.toLocaleTimeString('en-GB', { hour12: false });
    const dateString = currentTime.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

    const networkVal = parseInt(liveData?.network_status || "0");
    const networkColor = networkVal > 80 ? 'var(--good)' : networkVal >= 50 ? 'var(--warn)' : 'var(--bad)';
    const networkLabel = networkVal > 80 ? 'Strong' : networkVal >= 50 ? 'Moderate' : 'Weak';

    const isConnected = liveData?.status?.toLowerCase().includes('connected');

    const pfSys = parseFloat(liveData?.power_factor ?? 0);
    const hasPf = liveData?.power_factor !== undefined && liveData?.power_factor !== null && !isNaN(pfSys);
    const pfAbs = Math.abs(pfSys);
    const pfTone = !hasPf ? 'var(--text-dim)' : pfAbs >= PF_GOOD ? 'var(--good)' : pfAbs >= PF_FAIR ? 'var(--warn)' : 'var(--bad)';
    const pfQuality = !hasPf ? 'Waiting for data' : pfAbs >= PF_GOOD ? 'Good' : pfAbs >= PF_FAIR ? 'Fair' : 'Low';

    // Gauge ring geometry
    const RING_R = 84;
    const RING_C = 2 * Math.PI * RING_R;
    const ringOffset = RING_C * (1 - (hasPf ? pfPercent(pfSys) : 0) / 100);

    return (
        <div className="dashboard-wrapper">
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');

                :root {
                    /* Surfaces */
                    --bg: #060a13;
                    --surface: #0b1220;
                    --surface-2: rgba(255, 255, 255, 0.025);
                    --surface-3: rgba(255, 255, 255, 0.045);
                    --border: rgba(148, 163, 184, 0.10);
                    --border-strong: rgba(148, 163, 184, 0.18);

                    /* Text */
                    --text: #e6ebf3;
                    --text-muted: #8a97ab;
                    --text-dim: #5b687d;

                    /* Brand accent */
                    --accent: #22d3ee;
                    --accent-2: #818cf8;
                    --accent-grad: linear-gradient(135deg, #22d3ee 0%, #818cf8 100%);

                    /* Status */
                    --good: #34d399;
                    --warn: #fbbf24;
                    --bad: #f87171;

                    /* KPI tones */
                    --tone-active: #34d399;
                    --tone-apparent: #818cf8;
                    --tone-reactive: #f59e0b;

                    --radius: 14px;
                    --radius-sm: 10px;
                    --shadow: 0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 32px -16px rgba(0, 0, 0, 0.8);

                    --font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif;
                    --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
                }

                * { margin: 0; padding: 0; box-sizing: border-box; font-family: var(--font-sans); }

                html, body { max-width: 100%; overflow-x: hidden; }

                body {
                    background-color: var(--bg);
                    background-image:
                        radial-gradient(1100px 520px at 0% -10%, rgba(34, 211, 238, 0.07), transparent 60%),
                        radial-gradient(900px 480px at 100% -5%, rgba(129, 140, 248, 0.07), transparent 60%),
                        linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.018) 1px, transparent 1px);
                    background-size: auto, auto, 44px 44px, 44px 44px;
                    color: var(--text);
                    min-height: 100vh;
                    padding: 20px;
                    -webkit-font-smoothing: antialiased;
                }

                .dashboard-wrapper {
                    width: 100%;
                    max-width: 1600px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    min-height: calc(100vh - 40px);
                }
                .dashboard-wrapper > *, .main-grid > *, .kpi-row > * { min-width: 0; }

                .num { font-family: var(--font-mono); font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }

                /* Shared card surface */
                .surface {
                    background:
                        linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0) 45%),
                        var(--surface);
                    border: 1px solid var(--border);
                    border-radius: var(--radius);
                    box-shadow: var(--shadow);
                }

                /* --- HEADER --- */
                .app-header {
                    display: grid;
                    grid-template-columns: auto 1fr auto auto;
                    grid-template-areas: "left center widgets actions";
                    align-items: center;
                    gap: 16px;
                    padding: 12px 18px;
                    position: relative;
                    overflow: hidden;
                }
                .app-header::after {
                    content: ''; position: absolute; left: 0; right: 0; top: 0; height: 1px;
                    background: var(--accent-grad); opacity: 0.55;
                }

                .header-left    { grid-area: left; display: flex; align-items: center; gap: 14px; min-width: 0; }
                .header-center  { grid-area: center; display: flex; align-items: center; justify-content: center; gap: 12px; min-width: 0; }
                .header-widgets { grid-area: widgets; display: flex; align-items: center; gap: 10px; }
                .header-actions {
                    grid-area: actions; display: flex; align-items: center; gap: 8px;
                    border-left: 1px solid var(--border); padding-left: 14px;
                }

                .company-logo { height: 38px; object-fit: contain; flex-shrink: 0; }
                .brand-divider { width: 1px; height: 30px; background: var(--border-strong); flex-shrink: 0; }
                .brand-info { min-width: 0; }
                .brand-name { font-size: 0.92rem; font-weight: 600; color: var(--text); letter-spacing: -0.01em; }
                .brand-sub  { font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; display: flex; align-items: center; gap: 4px; }

                .ipqs-logo { height: 26px; object-fit: contain; opacity: 0.95; }
                .dashboard-title {
                    font-size: 0.72rem; font-weight: 600; letter-spacing: 0.18em; color: var(--text-muted); text-transform: uppercase;
                    display: flex; align-items: center; gap: 8px;
                }
                .live-tag {
                    font-size: 0.6rem; letter-spacing: 0.12em; font-weight: 700; color: var(--accent);
                    border: 1px solid rgba(34, 211, 238, 0.35); background: rgba(34, 211, 238, 0.08);
                    padding: 2px 7px; border-radius: 999px;
                }

                .chip {
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    background: var(--surface-2); border: 1px solid var(--border);
                    border-radius: var(--radius-sm); padding: 7px 12px; height: 44px;
                }

                .weather-widget .loc { font-size: 0.65rem; color: var(--text-muted); letter-spacing: 0.06em; text-transform: uppercase; }
                .weather-widget .temp { font-size: 1rem; font-weight: 600; color: var(--text); }
                .loc-temp { display: flex; flex-direction: column; text-align: right; line-height: 1.2; }

                .network-widget { font-size: 0.72rem; font-weight: 600; }

                .status-badge { font-weight: 600; font-size: 0.8rem; }
                .status-badge.active-status  { color: var(--good); border-color: rgba(52, 211, 153, 0.28); background: rgba(52, 211, 153, 0.07); }
                .status-badge.offline-status { color: var(--bad);  border-color: rgba(248, 113, 113, 0.28); background: rgba(248, 113, 113, 0.07); }
                .status-dot { position: relative; width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
                .status-dot::after {
                    content: ''; position: absolute; inset: 0; border-radius: 50%; background: currentColor;
                    animation: pulse 1.8s ease-out infinite;
                }
                @keyframes pulse { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(2.8); opacity: 0; } }

                .time-widget { flex-direction: column; align-items: flex-end; gap: 0; line-height: 1.2; }
                .time-display { font-size: 1.05rem; font-weight: 600; color: var(--text); }
                .date-display { font-size: 0.68rem; color: var(--text-muted); }

                .icon-btn {
                    background: var(--surface-2); border: 1px solid var(--border); color: var(--text-muted);
                    width: 38px; height: 38px; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s ease;
                    display: flex; align-items: center; justify-content: center;
                }
                .icon-btn:hover { background: var(--surface-3); color: var(--text); border-color: var(--border-strong); }

                .logout-btn {
                    background: rgba(248, 113, 113, 0.07); border: 1px solid rgba(248, 113, 113, 0.25); color: #fca5a5;
                    height: 38px; padding: 0 14px; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; font-size: 0.8rem;
                    transition: all 0.2s ease; display: flex; align-items: center; gap: 8px;
                }
                .logout-btn:hover { background: rgba(248, 113, 113, 0.14); color: #fecaca; }

                /* --- KPI ROW --- */
                .kpi-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
                .kpi-card {
                    position: relative; overflow: hidden;
                    padding: 16px 18px; display: flex; flex-direction: column; gap: 10px;
                }
                .kpi-card::before {
                    content: ''; position: absolute; left: 0; top: 0; right: 0; height: 2px;
                    background: linear-gradient(90deg, var(--tone), transparent 85%); opacity: 0.85;
                }
                .kpi-label {
                    display: flex; align-items: center; gap: 7px;
                    font-size: 0.7rem; font-weight: 600; color: var(--text-muted); letter-spacing: 0.06em; text-transform: uppercase;
                }
                .kpi-label .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--tone); box-shadow: 0 0 8px var(--tone); }
                .kpi-value { font-size: 1.45rem; font-weight: 600; color: var(--text); white-space: nowrap; }
                .kpi-value .unit { font-size: 0.72rem; font-weight: 500; color: var(--text-dim); font-family: var(--font-sans); margin-left: 4px; letter-spacing: 0; }

                /* --- MAIN GRID & PANELS --- */
                .main-grid { display: grid; grid-template-columns: 2.2fr 1fr; gap: 16px; flex: 1; }
                .panel { padding: 22px; display: flex; flex-direction: column; }

                .panel-header { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 20px; }
                .panel-title {
                    display: flex; align-items: center; gap: 10px;
                    font-size: 0.78rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase;
                    color: var(--text-muted); line-height: 1.3;
                }
                .panel-title::before {
                    content: ''; width: 3px; height: 14px; border-radius: 2px; background: var(--accent-grad); flex-shrink: 0;
                }
                .panel-icon {
                    width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
                    display: flex; align-items: center; justify-content: center;
                    color: var(--accent); background: rgba(34, 211, 238, 0.08); border: 1px solid rgba(34, 211, 238, 0.2);
                }

                .param-summary-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 22px; }
                .param-box {
                    min-width: 0; background: var(--surface-2); border: 1px solid var(--border);
                    border-radius: 12px; padding: 14px; text-align: left;
                }
                .param-title { display: block; font-size: 0.68rem; color: var(--text-muted); margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .param-val { font-size: 1.3rem; font-weight: 600; color: var(--text); white-space: nowrap; }
                .param-unit { font-size: 0.7rem; color: var(--text-dim); margin-left: 4px; font-family: var(--font-sans); font-weight: 500; }

                /* Table */
                .table-container { border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 8px; }
                .data-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
                .data-table th {
                    color: var(--text-dim); font-size: 0.68rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
                    padding: 14px 12px; background: rgba(255,255,255,0.02); border-bottom: 1px solid var(--border); text-align: center;
                }
                .data-table th .th-unit { color: var(--text-dim); opacity: 0.75; text-transform: none; letter-spacing: 0; margin-left: 3px; }
                .data-table td {
                    padding: 22px 12px; font-size: 1.05rem; font-weight: 600; text-align: center; color: var(--text);
                    border-bottom: 1px solid var(--border);
                    font-family: var(--font-mono); font-variant-numeric: tabular-nums;
                }
                .data-table tbody tr:last-child td { border-bottom: none; }
                .data-table tbody tr { transition: background 0.2s ease; }
                .data-table tbody tr:hover { background: rgba(255,255,255,0.02); }
                .data-table tbody tr td:first-child { box-shadow: inset 3px 0 0 var(--pc); }

                .phase-chip {
                    display: inline-flex; align-items: center; justify-content: center;
                    width: 32px; height: 32px; border-radius: 9px; font-family: var(--font-sans);
                    font-weight: 700; font-size: 0.85rem; color: var(--pc); background: var(--pc-soft);
                    border: 1px solid var(--pc);
                }

                /* Phone-only phase cards */
                .phase-cards { display: none; }
                .phase-card {
                    background: var(--surface-2); border: 1px solid var(--border);
                    border-radius: 12px; padding: 14px; position: relative; overflow: hidden;
                }
                .phase-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--pc); }
                .phase-card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
                .phase-card-head .phase-chip { width: 26px; height: 26px; font-size: 0.75rem; border-radius: 7px; }
                .phase-card-head span:last-child { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.12em; color: var(--text-muted); text-transform: uppercase; }
                .phase-card-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px 8px; }
                .phase-metric-label { display: block; font-size: 0.64rem; color: var(--text-dim); margin-bottom: 3px; }
                .phase-metric-value { font-weight: 600; font-size: 0.95rem; color: var(--text); }

                /* --- POWER FACTOR --- */
                .pf-panel { position: relative; }
                .avg-pf-container { display: flex; flex-direction: column; align-items: center; margin: auto 0; padding: 8px 0 20px; }
                .pf-gauge { position: relative; width: 200px; height: 200px; }
                .pf-gauge svg { width: 100%; height: 100%; transform: rotate(-90deg); }
                .pf-gauge .track { stroke: rgba(148, 163, 184, 0.1); }
                .pf-gauge .progress {
                    stroke: var(--pf-tone); transition: stroke-dashoffset 0.8s ease, stroke 0.4s ease;
                    filter: drop-shadow(0 0 6px var(--pf-tone));
                }
                .pf-gauge-center {
                    position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
                }
                .avg-pf-value { font-size: 2.4rem; font-weight: 600; color: var(--text); line-height: 1; }
                .avg-pf-label { font-size: 0.64rem; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-dim); }
                .pf-quality {
                    margin-top: 16px; font-size: 0.72rem; font-weight: 600; color: var(--pf-tone);
                    padding: 4px 12px; border-radius: 999px; border: 1px solid currentColor; background: rgba(255,255,255,0.02);
                }

                .phase-pf-list { display: flex; flex-direction: column; margin-top: auto; }
                .pf-row { padding: 14px 0; border-top: 1px solid var(--border); }
                .pf-row-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
                .pf-phase-name { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: var(--text-muted); font-weight: 500; }
                .pf-phase-name .phase-chip { width: 26px; height: 26px; font-size: 0.72rem; border-radius: 7px; }
                .pf-box {
                    font-size: 1.1rem; font-weight: 600; color: var(--pc);
                    padding: 4px 12px; border-radius: 8px; background: var(--pc-soft); min-width: 92px; text-align: center;
                }
                .pf-bar { height: 4px; border-radius: 999px; background: rgba(148, 163, 184, 0.1); overflow: hidden; }
                .pf-bar span { display: block; height: 100%; border-radius: 999px; background: var(--pc); transition: width 0.8s ease; }

                /* --- MODALS --- */
                .modal-overlay {
                    position: fixed; inset: 0; background: rgba(3, 6, 12, 0.75); backdrop-filter: blur(6px);
                    display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px;
                }
                .modal-content {
                    background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0) 40%), var(--surface);
                    border: 1px solid var(--border-strong); border-radius: 16px; padding: 26px;
                    width: 420px; max-width: 100%; max-height: 100%; overflow-y: auto;
                    box-shadow: 0 30px 60px -20px rgba(0,0,0,0.8); text-align: center;
                }
                .modal-title { font-size: 1.05rem; font-weight: 600; margin-bottom: 20px; color: var(--text); }
                .form-group { margin-bottom: 14px; text-align: left; }
                .form-group label { display: block; font-size: 0.72rem; font-weight: 500; color: var(--text-muted); margin-bottom: 6px; }
                .form-group input {
                    width: 100%; padding: 11px 12px; border-radius: var(--radius-sm);
                    background: rgba(0,0,0,0.25); border: 1px solid var(--border-strong);
                    color: var(--text); font-size: 16px; outline: none; transition: border-color 0.2s, box-shadow 0.2s;
                }
                .form-group input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.15); }
                .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 22px; }
                .btn { padding: 10px 18px; border-radius: var(--radius-sm); border: none; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: all 0.2s; }
                .btn-cancel { background: transparent; color: var(--text-muted); border: 1px solid var(--border-strong); }
                .btn-cancel:hover { color: var(--text); background: var(--surface-2); }
                .btn-submit { background: var(--accent-grad); color: #04121a; }
                .btn-submit:hover { filter: brightness(1.08); }
                .security-modal { border-color: rgba(248, 113, 113, 0.5); box-shadow: 0 0 40px rgba(248, 113, 113, 0.25); }
                .security-modal .modal-title { color: var(--bad); }
                .security-modal p { color: var(--text); line-height: 1.55; font-size: 0.9rem; }
                .text-error { color: var(--bad); font-size: 3rem; margin: 16px 0 6px; font-weight: 700; }
                .countdown-label { color: var(--text-dim); font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em; }

                @media (prefers-reduced-motion: reduce) {
                    .status-dot::after { animation: none; }
                    .pf-gauge .progress, .pf-bar span { transition: none; }
                }

                /* ==========================================
                   RESPONSIVE BREAKPOINTS
                   ========================================== */
                @media (max-width: 1280px) {
                    .app-header {
                        grid-template-columns: 1fr auto auto;
                        grid-template-areas:
                            "left widgets actions"
                            "center center center";
                    }
                    .header-center { border-top: 1px solid var(--border); padding-top: 10px; }
                    .kpi-row { grid-template-columns: repeat(3, 1fr); }
                }

                @media (max-width: 1024px) {
                    .main-grid { grid-template-columns: 1fr; }
                    .avg-pf-container { margin: 0; }
                }

                @media (max-width: 900px) {
                    .app-header {
                        grid-template-columns: 1fr auto;
                        grid-template-areas:
                            "left actions"
                            "widgets widgets"
                            "center center";
                        padding: 12px 14px;
                        gap: 12px;
                    }
                    .header-actions { border-left: none; padding-left: 0; }
                    .header-widgets { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
                    .time-widget { order: -1; align-items: center; }
                    .loc-temp { text-align: center; }
                }

                @media (max-width: 768px) {
                    .param-summary-row { grid-template-columns: repeat(2, 1fr); gap: 10px; }
                    .param-summary-row .param-box:last-child { grid-column: 1 / -1; }
                    .param-val { font-size: 1.15rem; }

                    .table-container { display: none; }
                    .phase-cards { display: grid; gap: 10px; }
                }

                @media (max-width: 600px) {
                    body { padding: 10px; }
                    .dashboard-wrapper { gap: 10px; min-height: calc(100vh - 20px); }

                    .company-logo { height: 30px; }
                    .brand-divider { display: none; }
                    .header-left { gap: 10px; }
                    .brand-name { font-size: 0.8rem; line-height: 1.3; }
                    .brand-sub { font-size: 0.66rem; }

                    .ipqs-logo { height: 20px; }
                    .dashboard-title { font-size: 0.6rem; letter-spacing: 0.12em; }

                    .icon-btn, .logout-btn { width: 36px; height: 36px; }
                    .logout-btn { padding: 0; justify-content: center; }
                    .logout-btn .logout-text { display: none; }

                    .header-widgets { grid-template-columns: repeat(3, 1fr); }
                    .chip { height: 42px; padding: 6px 8px; }
                    .time-widget { grid-column: 1 / -1; flex-direction: row; justify-content: space-between; padding: 6px 12px; }
                    .time-display { font-size: 1rem; }
                    .weather-widget .temp { font-size: 0.9rem; }
                    .network-widget, .status-badge { font-size: 0.7rem; gap: 6px; }

                    .kpi-row { grid-template-columns: repeat(2, 1fr); gap: 8px; }
                    .kpi-card { padding: 12px 14px; gap: 8px; }
                    .kpi-label { font-size: 0.62rem; letter-spacing: 0.04em; }
                    .kpi-value { font-size: 1.15rem; }
                    .kpi-value .unit { font-size: 0.62rem; }

                    .main-grid { gap: 10px; }
                    .panel { padding: 16px; }
                    .panel-header { margin-bottom: 16px; }
                    .panel-title { font-size: 0.7rem; letter-spacing: 0.1em; }
                    .panel-icon { width: 28px; height: 28px; }

                    .param-box { padding: 12px; }

                    .pf-gauge { width: 168px; height: 168px; }
                    .avg-pf-value { font-size: 2rem; }
                    .pf-box { font-size: 1rem; min-width: 84px; }

                    .modal-content { padding: 20px; }
                    .modal-actions .btn { flex: 1; }
                    .text-error { font-size: 2.4rem; }
                }

                @media (max-width: 380px) {
                    .phase-card-grid { grid-template-columns: repeat(2, 1fr); }
                    .kpi-value { font-size: 1.02rem; }
                }
                `}
            </style>

            {/* HEADER */}
            <header className="app-header surface">
                <div className="header-left">
                    <img src={tataLogo} alt="Tata Power" className="company-logo" />
                    <span className="brand-divider"></span>
                    <div className="brand-info">
                        <div className="brand-name">TP Kirnali Ltd. · 100 MW Solar Plant</div>
                        <div className="brand-sub"><PinIcon size={11} /> Partur, Maharashtra</div>
                    </div>
                </div>

                <div className="header-center">
                    <img src={ipqsLogo} alt="IPQS" className="ipqs-logo" />
                    <span className="dashboard-title">
                        Energy Monitoring Dashboard <span className="live-tag">LIVE</span>
                    </span>
                </div>

                <div className="header-widgets">
                    <div className="chip weather-widget">
                        <div className="loc-temp">
                            <span className="loc">Partur, MH</span>
                            <span className="temp num">{weather ? `${weather.temp}°C` : '--°'}</span>
                        </div>
                    </div>

                    <div className="chip network-widget" style={{ color: networkColor }}>
                        <WifiIcon size={15} />
                        <span>{networkLabel}</span>
                    </div>

                    <div className={`chip status-badge ${isConnected ? 'active-status' : 'offline-status'}`}>
                        <span className="status-dot"></span> {isConnected ? 'Active' : 'Offline'}
                    </div>

                    <div className="chip time-widget">
                        <div className="time-display num">{timeString}</div>
                        <div className="date-display">{dateString}</div>
                    </div>
                </div>

                <div className="header-actions">
                    <button className="icon-btn" title="Change Credentials" onClick={() => setOpenCredModal(true)}>
                        <GearIcon size={17} />
                    </button>
                    <button className="logout-btn" onClick={handleLogout} title="Logout">
                        <span className="logout-text">Logout</span> <LogoutIcon size={16} />
                    </button>
                </div>
            </header>

            {/* KPI ROW */}
            <div className="kpi-row">
                {KPIS.map(kpi => (
                    <div className="kpi-card surface" key={kpi.field} style={{ '--tone': kpi.tone }}>
                        <span className="kpi-label"><span className="dot"></span>{kpi.label}</span>
                        <div className="kpi-value num">
                            {formatEnergyCustom(liveData?.[kpi.field], kpi.divisor)}
                            <span className="unit">{kpi.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="main-grid">

                {/* LEFT PANEL: PHASE ELECTRICAL PARAMETERS */}
                <section className="panel surface">
                    <div className="panel-header">
                        <span className="panel-title">Phase Electrical Parameters</span>
                        <span className="panel-icon"><BoltIcon size={15} /></span>
                    </div>

                    <div className="param-summary-row">
                        {AVERAGE_METRICS.map(m => (
                            <div className="param-box" key={m.field}>
                                <span className="param-title">{m.label}</span>
                                <div className="param-val num">
                                    {m.fmt(liveData?.[m.field])}
                                    <span className="param-unit">{m.unit}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop / tablet: table */}
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Phase</th>
                                    {PHASE_METRICS.map(m => (
                                        <th key={m.field}>{m.label}<span className="th-unit">({m.unit})</span></th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {PHASES.map(p => (
                                    <tr key={p.key} style={{ '--pc': p.color, '--pc-soft': p.soft }}>
                                        <td><span className="phase-chip">{p.name}</span></td>
                                        {PHASE_METRICS.map(m => (
                                            <td key={m.field}>{m.fmt(liveData?.[`${m.field}_${p.key}`])}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Phone: one card per phase */}
                    <div className="phase-cards">
                        {PHASES.map(p => (
                            <div className="phase-card" key={p.key} style={{ '--pc': p.color, '--pc-soft': p.soft }}>
                                <div className="phase-card-head">
                                    <span className="phase-chip">{p.name}</span>
                                    <span>Phase {p.name}</span>
                                </div>
                                <div className="phase-card-grid">
                                    {PHASE_METRICS.map(m => (
                                        <div key={m.field}>
                                            <span className="phase-metric-label">{m.label} ({m.unit})</span>
                                            <span className="phase-metric-value num">{m.fmt(liveData?.[`${m.field}_${p.key}`])}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* RIGHT PANEL: LIVE POWER FACTOR ANALYSIS */}
                <section className="panel pf-panel surface" style={{ '--pf-tone': pfTone }}>
                    <div className="panel-header">
                        <span className="panel-title">Live Power Factor Analysis</span>
                        <span className="panel-icon"><GaugeIcon size={15} /></span>
                    </div>

                    <div className="avg-pf-container">
                        <div className="pf-gauge">
                            <svg viewBox="0 0 200 200">
                                <circle className="track" cx="100" cy="100" r={RING_R} fill="none" strokeWidth="10" />
                                <circle
                                    className="progress" cx="100" cy="100" r={RING_R} fill="none" strokeWidth="10"
                                    strokeLinecap="round" strokeDasharray={RING_C} strokeDashoffset={ringOffset}
                                />
                            </svg>
                            <div className="pf-gauge-center">
                                <div className="avg-pf-value num">{formatValue(liveData?.power_factor)}</div>
                                <div className="avg-pf-label">Avg Power Factor</div>
                            </div>
                        </div>
                        <span className="pf-quality">{pfQuality}</span>
                    </div>

                    <div className="phase-pf-list">
                        {PHASES.map(p => {
                            const raw = liveData?.[`pf_${p.key}`];
                            return (
                                <div className="pf-row" key={p.key} style={{ '--pc': p.color, '--pc-soft': p.soft }}>
                                    <div className="pf-row-top">
                                        <span className="pf-phase-name">
                                            <span className="phase-chip">{p.name}</span> Phase {p.name}
                                        </span>
                                        <span className="pf-box num">{formatValue(raw)}</span>
                                    </div>
                                    <div className="pf-bar"><span style={{ width: `${pfPercent(raw)}%` }}></span></div>
                                </div>
                            );
                        })}
                    </div>
                </section>

            </div>

            {/* CREDENTIALS MODAL */}
            {openCredModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-title">Update Credentials</div>
                        <div className="form-group">
                            <label>Company ID</label>
                            <input value={formData.companyId} onChange={e => setFormData({...formData, companyId: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>New Username</label>
                            <input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Super Security Code</label>
                            <input type="password" value={formData.securityCode} onChange={e => setFormData({...formData, securityCode: e.target.value})} />
                        </div>
                        <div className="modal-actions">
                            <button className="btn btn-cancel" onClick={() => setOpenCredModal(false)}>Cancel</button>
                            <button className="btn btn-submit" onClick={handleCredSubmit}>Update & Logout</button>
                        </div>
                    </div>
                </div>
            )}

            {/* SECURITY LOGOUT MODAL */}
            {showLogoutModal && (
                <div className="modal-overlay" style={{ backdropFilter: 'blur(10px)', zIndex: 9999 }}>
                    <div className="modal-content security-modal">
                        <div className="modal-title">Security Alert</div>
                        <p>
                            Your account credentials have been changed from another session. For your security, you are being automatically logged out.
                        </p>
                        <div className="text-error num">{logoutCountdown}</div>
                        <p className="countdown-label">Seconds Remaining</p>
                    </div>
                </div>
            )}

        </div>
    );
};

export default TataPowerDashboard;