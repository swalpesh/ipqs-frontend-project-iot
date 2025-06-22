import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { Home, Devices } from '@mui/icons-material';
import logo from '../assets/logo.png';
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose }) {
  const isMobile = window.innerWidth <= 1024;
  const location = useLocation();

  const handleNavClick = () => {
    if (isMobile && typeof onClose === 'function') {
      onClose(); // Automatically close sidebar
    }
  };

  return (
    <div
      className="d-flex flex-column p-3 bg-dark text-white shadow"
      style={{
        width: '240px',
        minHeight: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
        borderTopRightRadius: '20px',
        borderBottomRightRadius: '20px',
      }}
    >
      <div className="mb-4 text-center">
        <img
          src={logo}
          alt="IPQS Logo"
          style={{
            width: '180px',
            height: '60px',
            objectFit: 'contain',
            marginBottom: '8px',
          }}
        />
      </div>

      <Nav className="flex-column gap-2">
        <Nav.Link
          as={Link}
          to="/user"
          onClick={handleNavClick}
          className={`text-white d-flex align-items-center ${location.pathname === '/user' ? 'active' : ''}`}
        >
          <Home fontSize="small" className="me-2" />
          Dashboard
        </Nav.Link>

        <Nav.Link
          as={Link}
          to="/devices"
          onClick={handleNavClick}
          className={`text-white d-flex align-items-center ${location.pathname === '/devices' ? 'active' : ''}`}
        >
          <Devices fontSize="small" className="me-2" />
          My Devices
        </Nav.Link>
      </Nav>
    </div>
  );
}
