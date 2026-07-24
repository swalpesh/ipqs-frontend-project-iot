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

// ==========================================
// 2. MAIN COMPONENT
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
    const networkColor = networkVal > 80 ? 'var(--accent-green)' : networkVal >= 50 ? 'var(--accent-yellow)' : 'var(--accent-red)';
    const networkLabel = networkVal > 80 ? 'STRONG' : networkVal >= 50 ? 'MODERATE' : 'WEAK';
    
    const isConnected = liveData?.status?.toLowerCase().includes('connected');
    
    const pfSys = parseFloat(liveData?.power_factor ?? 0);

    return (
        <div className="dashboard-wrapper">
            <style>
                {`
                :root {
                    --bg-dark: #090e17; 
                    --card-bg: #111827;
                    --card-border: #1f2937;
                    --text-main: #f8fafc;
                    --text-muted: #94a3b8;
                    
                    --accent-blue: #06b6d4; 
                    --accent-green: #10b981;
                    --accent-yellow: #facc15;
                    --accent-orange: #f97316;
                    --accent-red: #ef4444; 
                    
                    --shadow-3d: 2px 2px 4px rgba(0,0,0,0.5), -1px -1px 2px rgba(255,255,255,0.05);
                }

                * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', sans-serif; }

                body {
                    background-color: var(--bg-dark);
                    background-image: 
                        linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
                    background-size: 40px 40px;
                    color: var(--text-main);
                    min-height: 100vh;
                    padding: 20px;
                }

                .dashboard-wrapper {
                    max-width: 1600px;
                    margin: 0 auto;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    min-height: calc(100vh - 40px);
                }

                /* --- HEADER --- */
                .app-header {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 12px 20px; background: rgba(17, 24, 39, 0.98); 
                    backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 10px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
                }
                
                .header-left, .header-center, .header-right { 
                    display: flex; align-items: center; gap: 15px; 
                }

                .company-logo { height: 40px; object-fit: contain; }
                .brand-info p { font-size: 0.85rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; font-weight: 500; }

                /* IPQS Center Styling */
                .ipqs-logo { height: 30px; object-fit: contain; }
                .dashboard-title { font-size: 0.85rem; font-weight: 600; letter-spacing: 2px; color: var(--text-muted); text-transform: uppercase; }

                .weather-widget {
                    display: flex; align-items: center; background: rgba(0, 0, 0, 0.3);
                    border: 1px solid var(--card-border); padding: 6px 12px; border-radius: 6px;
                }
                .loc-temp { display: flex; flex-direction: column; text-align: right; font-size: 0.70rem; color: var(--text-muted); }
                .loc-temp strong { font-size: 1rem; color: var(--text-main); font-family: 'Inter', sans-serif; }

                .network-widget {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    background: rgba(0, 0, 0, 0.3); border: 1px solid var(--card-border);
                    padding: 5px 10px; border-radius: 6px; font-size: 0.65rem; font-weight: 700;
                }

                .status-badge {
                    border-radius: 20px; font-weight: 600; font-size: 0.85rem; padding: 5px 12px;
                    display: flex; align-items: center; gap: 6px;
                }
                .status-badge.active-status { background: rgba(16, 185, 129, 0.1); color: var(--accent-green); border: 1px solid rgba(16, 185, 129, 0.3); }
                .status-badge.offline-status { background: rgba(239, 68, 68, 0.1); color: var(--accent-red); border: 1px solid rgba(239, 68, 68, 0.3); }
                .status-badge i { font-size: 0.55rem; }

                .time-widget { text-align: right; margin-right: 10px; }
                .time-display { font-size: 1.25rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
                .date-display { font-size: 0.75rem; color: var(--text-muted); }

                .header-actions { display: flex; align-items: center; gap: 10px; border-left: 1px solid var(--card-border); padding-left: 15px;}

                .icon-btn {
                    background: rgba(0, 0, 0, 0.3); border: 1px solid var(--card-border); color: var(--text-muted);
                    width: 35px; height: 35px; border-radius: 6px; cursor: pointer; transition: 0.2s ease;
                    display: flex; align-items: center; justify-content: center; font-size: 1rem;
                }
                .icon-btn:hover { background: rgba(255,255,255,0.08); color: var(--text-main); }

                .logout-btn {
                    background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: var(--accent-red);
                    padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: 0.2s ease;
                    display: flex; align-items: center; gap: 8px;
                }
                .logout-btn:hover { background: rgba(239, 68, 68, 0.2); }

                /* --- TOP KPI ROW --- */
                .kpi-row { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; }
                .kpi-card {
                    background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 8px;
                    padding: 15px; display: flex; flex-direction: column; align-items: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
                }
                .kpi-label { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px; }
                .kpi-value { font-size: 1.35rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
                .kpi-value .unit { font-size: 0.75rem; font-weight: 400; color: var(--text-muted); font-family: 'Inter', sans-serif;}

                /* --- MAIN GRID & PANELS --- */
                .main-grid { display: grid; grid-template-columns: 2.2fr 1fr; gap: 15px; flex: 1; }
                .panel {
                    background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 10px;
                    padding: 20px; box-shadow: 0 8px 16px rgba(0,0,0,0.4); display: flex; flex-direction: column;
                }
                .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
                .panel-header h2 { font-size: 0.90rem; color: var(--text-muted); letter-spacing: 1px; }

                .param-summary-row { display: flex; gap: 12px; margin-bottom: 20px; }
                .param-box { flex: 1; background: rgba(0,0,0,0.2); border: 1px solid var(--card-border); border-radius: 8px; padding: 12px 10px; text-align: center; }
                .param-title { font-size: 0.70rem; color: var(--text-muted); margin-bottom: 8px; white-space: nowrap; }
                .param-val { font-size: 1.3rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; margin-bottom: 2px; }
                .param-unit { font-size: 0.70rem; color: var(--text-muted); }

                .table-container { margin-top: 20px; margin-bottom: 40px; }
                .data-table { width: 100%; border-collapse: collapse; font-family: 'JetBrains Mono', monospace; table-layout: fixed; }
                .data-table th, .data-table td { border: 1px solid var(--card-border); }
                .data-table th { color: var(--text-muted); font-size: 0.85rem; font-weight: 500; padding: 16px 10px; background: rgba(0,0,0,0.2); }
                .data-table td { padding: 24px 10px; font-size: 1.1rem; font-weight: 600; text-align: center; }

                .row-r-color td { color: var(--accent-red); }
                .row-y-color td { color: var(--accent-yellow); }
                .row-b-color td { color: var(--accent-blue); }
                .phase-col { font-weight: 700 !important; }

                /* --- LIVE POWER FACTOR --- */
                .avg-pf-container { display: flex; flex-direction: column; align-items: center; margin: auto 0; }
                .avg-pf-label { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 15px; font-weight: 600; text-transform: uppercase; }
                .avg-pf-circle { width: 190px; height: 190px; border-radius: 50%; border: 2px solid var(--accent-blue); display: flex; align-items: center; justify-content: center; }
                .avg-pf-value { font-size: 2.6rem; font-weight: 700; color: var(--text-main); font-family: 'JetBrains Mono', monospace; }
                
                .phase-pf-list { display: flex; flex-direction: column; gap: 8px; margin-top: auto; }
                .pf-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-top: 1px solid var(--card-border); }
                .pf-phase-name { font-size: 0.95rem; color: var(--text-muted); font-weight: 600; flex: 1; }
                .pf-box { font-size: 1.3rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; padding: 4px 16px; border-radius: 6px; text-align: center; min-width: 110px; }
                
                .pf-box-r { background: rgba(239, 68, 68, 0.12); border: 1.5px solid var(--accent-red); color: var(--accent-red); }
                .pf-box-y { background: rgba(250, 204, 21, 0.12); border: 1.5px solid var(--accent-yellow); color: var(--accent-yellow); }
                .pf-box-b { background: rgba(6, 182, 212, 0.12); border: 1.5px solid var(--accent-blue); color: var(--accent-blue); }

                /* --- MODALS --- */
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.8); backdrop-filter: blur(4px);
                    display: flex; align-items: center; justify-content: center; z-index: 1000;
                }
                .modal-content {
                    background: var(--card-bg); border: 1px solid var(--card-border);
                    border-radius: 12px; padding: 25px; width: 400px; max-width: 90%;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center;
                }
                .modal-content h3 { margin-bottom: 20px; font-weight: 600; }
                .form-group { margin-bottom: 15px; text-align: left; }
                .form-group label { display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 5px; }
                .form-group input {
                    width: 100%; padding: 10px; border-radius: 6px;
                    background: rgba(0,0,0,0.3); border: 1px solid var(--card-border);
                    color: var(--text-main); font-family: inherit; outline: none;
                }
                .form-group input:focus { border-color: var(--accent-blue); }
                .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 25px; }
                .btn { padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; }
                .btn-cancel { background: transparent; color: var(--text-muted); border: 1px solid var(--card-border); }
                .btn-submit { background: var(--accent-blue); color: #fff; }
                .text-error { color: var(--accent-red); font-size: 3rem; margin: 15px 0; font-family: 'JetBrains Mono', monospace; font-weight: bold; }

                /* Mobile Adjustments */
                @media (max-width: 1200px) {
                    .header-center { display: none; } /* Hide IPQS center text on smaller screens to prevent overflow */
                }
                `}
            </style>
            
            {/* HEADER */}
            <header className="app-header">
                {/* Left: Tata Power Branding */}
                <div className="header-left">
                    <img src={tataLogo} alt="Tata Power" className="company-logo" />
                    <div className="brand-info">
                        <p>TP Kirnali Ltd. 100 MW Solar Plant, Partur</p>
                    </div>
                </div>
                
                {/* Center: IPQS Branding */}
                <div className="header-center">
                    <img src={ipqsLogo} alt="IPQS" className="ipqs-logo" />
                    <span className="dashboard-title">ENERGY MONITORING DASHBOARD (LIVE)</span>
                </div>

                {/* Right: Widgets & Controls */}
                <div className="header-right">
                    <div className="weather-widget">
                        <div className="loc-temp">
                            <span>PARTUR, MH</span>
                            <strong>{weather ? `${weather.temp}°` : '--°'}</strong>
                        </div>
                    </div>

                    <div className="network-widget" style={{ color: networkColor }}>
                        <i className="fa-solid fa-wifi" style={{ textShadow: `0 0 8px ${networkColor}` }}></i>
                        <span>{networkLabel}</span>
                    </div>

                    <div className={`status-badge ${isConnected ? 'active-status' : 'offline-status'}`}>
                        <i className="fa-solid fa-circle"></i> {isConnected ? 'Active' : 'Offline'}
                    </div>

                    <div className="time-widget">
                        <div className="time-display">{timeString}</div>
                        <div className="date-display">{dateString}</div>
                    </div>

                    <div className="header-actions">
                        <button className="icon-btn" title="Change Credentials" onClick={() => setOpenCredModal(true)}>
                            <i className="fa-solid fa-gear"></i>
                        </button>
                        <button className="logout-btn" onClick={handleLogout} title="Logout">
                            Logout <i className="fa-solid fa-arrow-right-from-bracket"></i>
                        </button>
                    </div>
                </div>
            </header>

            {/* TOP KPI ROW */}
            <div className="kpi-row">
                <div className="kpi-card">
                    <span className="kpi-label">KWH IMPORT</span>
                    <div className="kpi-value">{formatEnergyCustom(liveData?.kwh_import, 1000)} <span className="unit">kWh</span></div>
                </div>
                <div className="kpi-card">
                    <span className="kpi-label">KWH EXPORT</span>
                    <div className="kpi-value">{formatEnergyCustom(liveData?.kwh_export, 1000)} <span className="unit">kWh</span></div>
                </div>
                <div className="kpi-card">
                    <span className="kpi-label">KVAH IMPORT</span>
                    <div className="kpi-value highlight-orange">{formatEnergyCustom(liveData?.kvah_import, 1000)} <span className="unit">kVAh</span></div>
                </div>
                <div className="kpi-card">
                    <span className="kpi-label">KVAH EXPORT</span>
                    <div className="kpi-value highlight-orange">{formatEnergyCustom(liveData?.kvah_export, 1000)} <span className="unit">kVAh</span></div>
                </div>
                <div className="kpi-card">
                    <span className="kpi-label">KVARH IMPORT</span>
                    <div className="kpi-value highlight-green">{formatEnergyCustom(liveData?.kvarh_import, 10)} <span className="unit">kVArh</span></div>
                </div>
                <div className="kpi-card">
                    <span className="kpi-label">KVARH EXPORT</span>
                    <div className="kpi-value highlight-green">{formatEnergyCustom(liveData?.kvarh_export, 100)} <span className="unit">kVArh</span></div>
                </div>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="main-grid">
                
                {/* LEFT PANEL: PHASE ELECTRICAL PARAMETERS */}
                <div className="panel">
                    <div className="panel-header">
                        <h2>PHASE ELECTRICAL PARAMETERS</h2>
                        <i className="fa-solid fa-bolt icon-3d-bolt"></i>
                    </div>
                    
                    <div className="param-summary-row">
                        <div className="param-box">
                            <span className="param-title">Average Voltage</span>
                            <div className="param-val">{formatVoltage(liveData?.voltage)}</div>
                            <span className="param-unit">kV</span>
                        </div>
                        <div className="param-box">
                            <span className="param-title">Average Current</span>
                            <div className="param-val highlight-green">{formatValue(liveData?.current)}</div>
                            <span className="param-unit">A</span>
                        </div>
                        <div className="param-box">
                            <span className="param-title">Average Active</span>
                            <div className="param-val">{formatValue(liveData?.kw)}</div>
                            <span className="param-unit">MW</span>
                        </div>
                        <div className="param-box">
                            <span className="param-title">Average Reactive</span>
                            <div className="param-val">{formatValue(liveData?.kvar)}</div>
                            <span className="param-unit">MVAr</span>
                        </div>
                        <div className="param-box">
                            <span className="param-title">Average Apparent</span>
                            <div className="param-val">{formatValue(liveData?.kva)}</div>
                            <span className="param-unit">MVA</span>
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Phase</th>
                                    <th>Voltage (kV)</th>
                                    <th>Current (A)</th>
                                    <th>Active (MW)</th>
                                    <th>Apparent (kVA)</th>
                                    <th>Reactive (kVAr)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="row-r-color">
                                    <td className="phase-col">R</td>
                                    <td>{formatVoltage(liveData?.voltage_r)}</td>
                                    <td>{formatValue(liveData?.current_r)}</td>
                                    <td>{formatValue(liveData?.kw_r)}</td>
                                    <td>{formatValue(liveData?.kva_r)}</td>
                                    <td>{formatValue(liveData?.kvar_r)}</td>
                                </tr>
                                <tr className="row-y-color">
                                    <td className="phase-col">Y</td>
                                    <td>{formatVoltage(liveData?.voltage_y)}</td>
                                    <td>{formatValue(liveData?.current_y)}</td>
                                    <td>{formatValue(liveData?.kw_y)}</td>
                                    <td>{formatValue(liveData?.kva_y)}</td>
                                    <td>{formatValue(liveData?.kvar_y)}</td>
                                </tr>
                                <tr className="row-b-color">
                                    <td className="phase-col">B</td>
                                    <td>{formatVoltage(liveData?.voltage_b)}</td>
                                    <td>{formatValue(liveData?.current_b)}</td>
                                    <td>{formatValue(liveData?.kw_b)}</td>
                                    <td>{formatValue(liveData?.kva_b)}</td>
                                    <td>{formatValue(liveData?.kvar_b)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* RIGHT PANEL: LIVE POWER FACTOR ANALYSIS */}
                <div className="panel pf-panel">
                    <div className="panel-header">
                        <h2>LIVE POWER FACTOR ANALYSIS</h2>
                        <i className="fa-solid fa-gauge-high icon-3d-gauge"></i>
                    </div>

                    <div className="avg-pf-container">
                        <span className="avg-pf-label">AVERAGE POWER FACTOR</span>
                        <div className="avg-pf-circle">
                            <div className="avg-pf-value">{formatValue(pfSys)}</div>
                        </div>
                    </div>

                    <div className="phase-pf-list">
                        <div className="pf-row">
                            <span className="pf-phase-name">Phase R</span>
                            <div className="pf-box pf-box-r">{formatValue(liveData?.pf_r)}</div>
                        </div>
                        <div className="pf-row">
                            <span className="pf-phase-name">Phase Y</span>
                            <div className="pf-box pf-box-y">{formatValue(liveData?.pf_y)}</div>
                        </div>
                        <div className="pf-row">
                            <span className="pf-phase-name">Phase B</span>
                            <div className="pf-box pf-box-b">{formatValue(liveData?.pf_b)}</div>
                        </div>
                    </div>
                </div>

            </div>

            {/* CREDENTIALS MODAL */}
            {openCredModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Update Credentials</h3>
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
                    <div className="modal-content" style={{ border: '2px solid var(--accent-red)', boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)' }}>
                        <h3 style={{ color: 'var(--accent-red)' }}>Security Alert</h3>
                        <p style={{ color: 'var(--text-main)', lineHeight: '1.5' }}>
                            Your account credentials have been changed from another session. For your security, you are being automatically logged out.
                        </p>
                        <div className="text-error">{logoutCountdown}</div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Seconds Remaining
                        </p>
                    </div>
                </div>
            )}

        </div>
    );
};

export default TataPowerDashboard;