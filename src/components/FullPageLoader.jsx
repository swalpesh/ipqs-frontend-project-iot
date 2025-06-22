import React from 'react';
import logo from '../assets/logo.png'; 

export default function FullPageLoader() {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#f8f9fa',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <img src={logo} alt="Loading..." style={{ width: 200, marginBottom: 20 }} />
      <div className="spinner-border text-primary" role="status" />
    </div>
  );
}
