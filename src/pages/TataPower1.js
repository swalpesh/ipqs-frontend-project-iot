import React from 'react';

const TataPower1 = () => {
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

                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    font-family: 'Inter', sans-serif;
                }

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
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 20px;
                    background: rgba(17, 24, 39, 0.98); 
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 10px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .logo-icon-3d i {
                    font-size: 1.8rem;
                    color: #38bdf8;
                    text-shadow: 2px 3px 5px rgba(0,0,0,0.6), inset 1px 1px 2px rgba(255,255,255,0.4);
                    background: -webkit-linear-gradient(#bae6fd, #0284c7);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .brand-info h1 {
                    font-size: 1.3rem;
                    font-weight: 700;
                    letter-spacing: 1px;
                }

                .brand-info p {
                    font-size: 0.80rem;
                    color: var(--text-muted);
                    font-family: 'JetBrains Mono', monospace;
                    margin-top: 2px;
                }

                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .weather-widget {
                    display: flex;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid var(--card-border);
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-family: 'JetBrains Mono', monospace;
                }

                .loc-temp { 
                    display: flex; 
                    flex-direction: column; 
                    text-align: right; 
                    font-size: 0.70rem; 
                    color: var(--text-muted); 
                }
                .loc-temp strong { 
                    font-size: 1rem; 
                    color: var(--text-main); 
                    font-family: 'Inter', sans-serif;
                }

                .network-widget {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0, 0, 0, 0.3);
                    border: 1px solid var(--card-border);
                    padding: 5px 10px;
                    border-radius: 6px;
                    color: var(--accent-green);
                    font-size: 0.65rem;
                    font-weight: 700;
                }
                .network-widget i { 
                    font-size: 1rem; 
                    margin-bottom: 2px; 
                    text-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
                }

                .status-badge {
                    background: rgba(16, 185, 129, 0.1);
                    color: var(--accent-green);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    padding: 5px 12px;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .status-badge i { font-size: 0.55rem; text-shadow: 0 0 8px var(--accent-green); }

                .time-widget {
                    font-family: 'JetBrains Mono', monospace;
                    text-align: right;
                }
                .time-display { font-size: 1.25rem; font-weight: 700; color: var(--text-main); }
                .date-display { font-size: 0.75rem; color: var(--text-muted); }

                .logout-btn {
                    background: transparent;
                    border: 1px solid var(--card-border);
                    color: var(--text-main);
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.85rem;
                    transition: 0.2s ease;
                }
                .logout-btn:hover { background: rgba(255,255,255,0.05); }

                /* --- TOP KPI ROW --- */
                .kpi-row {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 12px;
                }

                .kpi-card {
                    background: var(--card-bg);
                    border: 1px solid var(--card-border);
                    border-radius: 8px;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
                }

                .kpi-label {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    margin-bottom: 8px;
                }

                .kpi-value {
                    font-size: 1.35rem;
                    font-weight: 700;
                    color: var(--text-main);
                    font-family: 'JetBrains Mono', monospace;
                }
                .kpi-value .unit { font-size: 0.75rem; font-weight: 400; color: var(--text-muted); font-family: 'Inter', sans-serif;}

                .highlight-orange { color: var(--accent-orange); }
                .highlight-green { color: var(--accent-green); }

                /* --- MAIN GRID --- */
                .main-grid {
                    display: grid;
                    grid-template-columns: 2.2fr 1fr;
                    gap: 15px;
                    flex: 1; 
                }

                .panel {
                    background: var(--card-bg);
                    border: 1px solid var(--card-border);
                    border-radius: 10px;
                    padding: 20px;
                    box-shadow: 0 8px 16px rgba(0,0,0,0.4);
                    display: flex;
                    flex-direction: column;
                }

                .panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 18px;
                }

                .panel-header h2 {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.90rem;
                    color: var(--text-muted);
                    letter-spacing: 1px;
                }

                .icon-3d-bolt {
                    color: #60a5fa;
                    font-size: 1.1rem;
                    text-shadow: 0 0 10px rgba(96, 165, 250, 0.4), var(--shadow-3d);
                }
                .icon-3d-gauge {
                    color: var(--accent-green);
                    font-size: 1.1rem;
                    text-shadow: 0 0 10px rgba(16, 185, 129, 0.4), var(--shadow-3d);
                }

                /* --- PARAMETER SUMMARY ROW (Left Panel) --- */
                .param-summary-row {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .param-box {
                    flex: 1;
                    background: rgba(0,0,0,0.2);
                    border: 1px solid var(--card-border);
                    border-radius: 8px;
                    padding: 12px 10px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }

                .param-title {
                    font-size: 0.70rem;
                    color: var(--text-muted);
                    margin-bottom: 8px;
                    white-space: nowrap; 
                }

                .param-val {
                    font-size: 1.3rem;
                    font-weight: 700;
                    font-family: 'JetBrains Mono', monospace;
                    margin-bottom: 2px;
                }

                .param-unit {
                    font-size: 0.70rem;
                    color: var(--text-muted);
                }

                /* --- DATA TABLE (Left Panel) --- */
                .table-container {
                    margin-top: 20px; 
                    margin-bottom: 40px; 
                }

                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-family: 'JetBrains Mono', monospace;
                    table-layout: fixed; 
                }

                .data-table th, .data-table td {
                    border: 1px solid var(--card-border);
                }

                .data-table th {
                    color: var(--text-muted);
                    font-size: 0.85rem; 
                    font-weight: 500;
                    padding: 16px 10px; 
                    text-align: center;
                    background: rgba(0,0,0,0.2); 
                }

                .data-table th:first-child {
                    width: 12%; 
                }

                .data-table td {
                    padding: 24px 10px; 
                    font-size: 1.1rem; 
                    font-weight: 600;
                    text-align: center; 
                }

                .row-r-color td { color: var(--accent-red); }
                .row-y-color td { color: var(--accent-yellow); }
                .row-b-color td { color: var(--accent-blue); }

                .phase-col {
                    font-weight: 700 !important;
                }

                /* --- LIVE POWER FACTOR (Right Panel) --- */
                .avg-pf-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin: auto 0; 
                }

                .avg-pf-label {
                    color: var(--text-muted);
                    font-size: 0.85rem;
                    margin-bottom: 15px;
                    font-weight: 600;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                }

                .avg-pf-circle {
                    width: 190px; 
                    height: 190px; 
                    border-radius: 50%;
                    border: 2px solid var(--accent-blue);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .avg-pf-value {
                    font-size: 2.6rem; 
                    font-weight: 700;
                    color: var(--accent-green);
                    font-family: 'JetBrains Mono', monospace;
                }

                .phase-pf-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px; 
                    margin-top: auto; 
                }

                .pf-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 0; 
                    border-top: 1px solid var(--card-border);
                }

                .pf-phase-name {
                    font-size: 0.95rem; 
                    color: var(--text-muted);
                    font-weight: 600;
                    flex: 1;
                }

                .pf-box {
                    font-size: 1.3rem;
                    font-weight: 700;
                    font-family: 'JetBrains Mono', monospace;
                    padding: 4px 16px;
                    border-radius: 6px;
                    text-align: center;
                    min-width: 110px;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                }

                .pf-box-r { 
                    background: rgba(239, 68, 68, 0.12); 
                    border: 1.5px solid var(--accent-red); 
                    color: var(--accent-red); 
                }
                .pf-box-y { 
                    background: rgba(250, 204, 21, 0.12); 
                    border: 1.5px solid var(--accent-yellow); 
                    color: var(--accent-yellow); 
                }
                .pf-box-b { 
                    background: rgba(6, 182, 212, 0.12); 
                    border: 1.5px solid var(--accent-blue); 
                    color: var(--accent-blue); 
                }

                /* Responsive adjustments */
                @media (max-width: 1400px) {
                    .dashboard-wrapper { min-height: auto; }
                    .main-grid { grid-template-columns: 1fr; }
                    .kpi-row { grid-template-columns: repeat(3, 1fr); }
                }
                `}
            </style>
            
            {/* HEADER */}
            <header className="app-header">
                <div className="header-left">
                    <div className="logo-icon-3d">
                        <i className="fa-solid fa-solar-panel"></i>
                    </div>
                    <div className="brand-info">
                        <h1>TataPower</h1>
                        <p>TP Kirnali Ltd. 100 MW Solar Plant, Partur</p>
                    </div>
                </div>
                
                <div className="header-right">
                    <div className="weather-widget">
                        <div className="loc-temp">
                            <span>PARTUR, MH</span>
                            <strong>32°</strong>
                        </div>
                    </div>

                    <div className="network-widget">
                        <i className="fa-solid fa-wifi"></i>
                        <span>GOOD</span>
                    </div>

                    <div className="status-badge active-status">
                        <i className="fa-solid fa-circle"></i> Active
                    </div>

                    <div className="time-widget">
                        <div className="time-display">15:17:38</div>
                        <div className="date-display">Mon, 29 Jun 2026</div>
                    </div>

                    <button className="logout-btn">
                        Logout <i className="fa-solid fa-arrow-right-from-bracket"></i>
                    </button>
                </div>
            </header>

            {/* TOP KPI ROW */}
            <div className="kpi-row">
                <div className="kpi-card">
                    <span className="kpi-label">KWH IMPORT</span>
                    <div className="kpi-value">225 <span className="unit">kWh</span></div>
                </div>
                <div className="kpi-card">
                    <span className="kpi-label">KWH EXPORT</span>
                    <div className="kpi-value">46894 <span className="unit">kWh</span></div>
                </div>
                <div className="kpi-card">
                    <span className="kpi-label">KVAH IMPORT</span>
                    <div className="kpi-value highlight-orange">229 <span className="unit">kVAh</span></div>
                </div>
                <div className="kpi-card">
                    <span className="kpi-label">KVAH EXPORT</span>
                    <div className="kpi-value highlight-orange">47092 <span className="unit">kVAh</span></div>
                </div>
                <div className="kpi-card">
                    <span className="kpi-label">KVARH IMPORT</span>
                    <div className="kpi-value highlight-green">809 <span className="unit">kVArh</span></div>
                </div>
                <div className="kpi-card">
                    <span className="kpi-label">KVARH EXPORT</span>
                    <div className="kpi-value highlight-green">54092 <span className="unit">kVArh</span></div>
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
                            <div className="param-val">135.22</div>
                            <span className="param-unit">kV</span>
                        </div>
                        <div className="param-box">
                            <span className="param-title">Average Current</span>
                            <div className="param-val highlight-green">1.013</div>
                            <span className="param-unit">A</span>
                        </div>
                        <div className="param-box">
                            <span className="param-title">Average Active</span>
                            <div className="param-val">-6.28</div>
                            <span className="param-unit">MW</span>
                        </div>
                        <div className="param-box">
                            <span className="param-title">Average Reactive</span>
                            <div className="param-val">1.42</div>
                            <span className="param-unit">MVAr</span>
                        </div>
                        <div className="param-box">
                            <span className="param-title">Average Apparent</span>
                            <div className="param-val">6.43</div>
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
                                    <td>136.54</td>
                                    <td>270.482</td>
                                    <td>-21.016</td>
                                    <td>36931</td>
                                    <td>30349</td>
                                </tr>
                                <tr className="row-y-color">
                                    <td className="phase-col">Y</td>
                                    <td>134.80</td>
                                    <td>0.000</td>
                                    <td>0.000</td>
                                    <td>0</td>
                                    <td>0</td>
                                </tr>
                                <tr className="row-b-color">
                                    <td className="phase-col">B</td>
                                    <td>134.33</td>
                                    <td>272.766</td>
                                    <td>2.181</td>
                                    <td>36640</td>
                                    <td>36575</td>
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
                            <div className="avg-pf-value">-0.995</div>
                        </div>
                    </div>

                    <div className="phase-pf-list">
                        <div className="pf-row">
                            <span className="pf-phase-name">Phase R</span>
                            <div className="pf-box pf-box-r">-0.993</div>
                        </div>
                        <div className="pf-row">
                            <span className="pf-phase-name">Phase Y</span>
                            <div className="pf-box pf-box-y">&nbsp;0.000</div>
                        </div>
                        <div className="pf-row">
                            <span className="pf-phase-name">Phase B</span>
                            <div className="pf-box pf-box-b">-0.997</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TataPower1;