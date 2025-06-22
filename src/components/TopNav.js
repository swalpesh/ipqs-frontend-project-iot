import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  Paper,
} from '@mui/material';
import { Notifications, Logout } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationDropdown from './NotificationDropdown';
import { useNavigate, useLocation } from 'react-router-dom';

export default function TopNav({ onToggleSidebar }) {
  const [darkMode, setDarkMode] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [devices, setDevices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [companyInitial, setCompanyInitial] = useState('C');

  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLogout = () => {
    localStorage.clear(); // ✅ Clear token and all user data
    navigate('/login'); // ✅ Redirect to login page
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('bg-dark', 'text-white');
      setDarkMode(true);
    }

    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${process.env.REACT_APP_API_BASE_URL}/company/devices`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setDevices(data.devices || []))
      .catch(() => setDevices([]));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${process.env.REACT_APP_API_BASE_URL}/company/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const name = data.company?.company_name;
        if (name) setCompanyInitial(name.charAt(0).toUpperCase());
      })
      .catch(() => setCompanyInitial('C'));
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDevices([]);
      setShowSuggestions(false);
    } else {
      const matches = devices.filter((d) =>
        d.device_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDevices(matches);
      setShowSuggestions(true);
    }
  }, [searchQuery, devices]);

  const handleSuggestionClick = (deviceId) => {
    navigate(`/devices/${deviceId}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const SearchInput = (
    <div className="position-relative" style={{ width: isMobile ? '100%' : '300px' }}>
      <input
        type="text"
        placeholder="Search By Device Name"
        className="form-control"
        style={{ borderRadius: '8px', fontSize: '0.95rem', padding: '6px 12px' }}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {showSuggestions && (
        <Paper
          className="position-absolute shadow-sm"
          style={{ width: '100%', zIndex: 1000, maxHeight: 200, overflowY: 'auto' }}
        >
          <List>
            {filteredDevices.map((device) => (
              <ListItem
                key={device.device_id}
                button
                onClick={() => handleSuggestionClick(device.device_id)}
              >
                <ListItemText primary={device.device_name} secondary={device.device_id} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </div>
  );

  return (
    <AppBar
      position="static"
      color="default"
      elevation={1}
      style={{ background: darkMode ? '#1c1c1c' : '#f8f9fa' }}
    >
      <Toolbar
        className="d-flex flex-column px-3 px-md-4"
        style={{ paddingTop: '12px', paddingBottom: '12px' }}
      >
        {/* TOP ROW */}
        <div className="d-flex justify-content-between align-items-center w-100">
          <div className="d-flex align-items-center gap-2">
            {isMobile && (
              <IconButton onClick={onToggleSidebar}>
                <MenuIcon />
              </IconButton>
            )}
            {!isMobile && !isAdmin && SearchInput}
          </div>

          <div className="d-flex align-items-center gap-2 position-relative">
            {!isAdmin && (
              <>
                <IconButton onClick={() => setShowDropdown(!showDropdown)}>
                  <Notifications fontSize="small" />
                </IconButton>

                <Tooltip title="Profile">
                  <Avatar
                    sx={{
                      cursor: 'pointer',
                      bgcolor: '#ADD8E6',
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                    onClick={handleProfileClick}
                  >
                    {companyInitial}
                  </Avatar>
                </Tooltip>
              </>
            )}

            <IconButton onClick={handleLogout}>
              <Logout fontSize="small" />
            </IconButton>

            {showDropdown && !isAdmin && (
              <NotificationDropdown onClose={() => setShowDropdown(false)} />
            )}
          </div>
        </div>

        {/* Mobile Searchbar */}
        {!isAdmin && isMobile && <div className="w-100 mt-2">{SearchInput}</div>}
      </Toolbar>
    </AppBar>
  );
}
