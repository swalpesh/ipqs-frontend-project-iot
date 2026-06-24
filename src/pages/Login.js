import { Form, Button, Card, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import logo from '../assets/logo.png';
import './Login.css';

export default function Login() {
  // --- LOGIN STATE ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // --- CREDENTIALS MODAL STATE ---
  const [showModal, setShowModal] = useState(false);
  const [credCompanyId, setCredCompanyId] = useState('');
  const [credUsername, setCredUsername] = useState('');
  const [credPassword, setCredPassword] = useState('');
  const [credSecurityCode, setCredSecurityCode] = useState('');
  const [showCredPassword, setShowCredPassword] = useState(false);
  const [credLoading, setCredLoading] = useState(false);
  const [credMessage, setCredMessage] = useState({ type: '', text: '' }); // type: 'success' | 'error'

  // --- TOGGLES ---
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleCredPasswordVisibility = () => setShowCredPassword((prev) => !prev);
  const handleCloseModal = () => {
    setShowModal(false);
    setCredMessage({ type: '', text: '' });
  };
  const handleOpenModal = () => setShowModal(true);

  // --- LOGIN HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const adminUsername = 'technical@ipqspl.com';
    const tataPowerUsername = 'TataPowerJalna@2026';

    const endpoint =
      username.toLowerCase() === adminUsername
        ? `${process.env.REACT_APP_API_BASE_URL}/admin/login`
        : `${process.env.REACT_APP_API_BASE_URL}/company/auth/login`;

    try {
      const response = await axios.post(endpoint, { username, password });
      const { token, role } = response.data;

      // Save credentials and identifiers to local storage
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('username', username);

      setTimeout(() => {
        /* 🔥 SPECIAL REDIRECTION FOR TATA POWER */
        if (username === tataPowerUsername) {
          navigate('/tatapower');
        } 
        else if (role === 'admin') {
          navigate('/admin/dashboard');
        } 
        else if (role === 'company') {
          navigate('/user');
        } 
        else {
          setErrorMsg('Unknown user role. Access denied.');
        }

        setLoading(false);
      }, 800);

    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      setErrorMsg(error.response?.data?.message || 'Login failed.');
      setLoading(false);
    }
  };

  // --- UPDATE CREDENTIALS HANDLER ---
  const handleCredSubmit = async (e) => {
    e.preventDefault();
    setCredLoading(true);
    setCredMessage({ type: '', text: '' });

    try {
      const response = await axios.put(`https://ipqsoms.com/api/companies/${credCompanyId}/credentials`, {
        company_username: credUsername,
        company_password: credPassword,
        Supersecuritycode: credSecurityCode
      });

      setCredMessage({ type: 'success', text: response.data.message || 'Credentials updated successfully!' });
      
      // Auto-close modal after 2 seconds on success
      setTimeout(() => {
        handleCloseModal();
        // Clear fields on success so they are fresh next time
        setCredCompanyId('');
        setCredUsername('');
        setCredPassword('');
        setCredSecurityCode('');
      }, 2000);

    } catch (error) {
      console.error('Update credentials failed:', error);
      setCredMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update credentials. Please check your inputs.' 
      });
    } finally {
      setCredLoading(false);
    }
  };

  return (
    <div className="login-background d-flex justify-content-center align-items-center vh-100">
      
      {/* --- MAIN LOGIN CARD --- */}
      <Card className="p-5 shadow-lg rounded-5 login-card">
        <div className="text-center mb-4">
          <img src={logo} alt="IPQS Logo" style={{ width: '200px' }} />
          <h5 className="mt-3 text-muted">Sign in to continue</h5>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-4">
            <Form.Control
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="form-control-lg rounded-4"
              disabled={loading}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <InputGroup>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-control-lg rounded-4"
                disabled={loading}
              />
              <InputGroup.Text className="bg-white border-start-0 rounded-end-4">
                <IconButton
                  onClick={togglePasswordVisibility}
                  size="small"
                  style={{ padding: 0 }}
                  disabled={loading}
                >
                  {showPassword ? (
                    <VisibilityOff fontSize="small" />
                  ) : (
                    <Visibility fontSize="small" />
                  )}
                </IconButton>
              </InputGroup.Text>
            </InputGroup>
          </Form.Group>

          <Button
            type="submit"
            className="w-100 btn-lg rounded-4 mb-3"
            variant="dark"
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Logging in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          {errorMsg && (
            <div className="text-danger text-center mb-3">
              {errorMsg}
            </div>
          )}

          {/* Change Credentials Link */}
          <div className="text-center">
            <Button 
              variant="link" 
              className="text-muted text-decoration-none p-0" 
              onClick={handleOpenModal}
              disabled={loading}
            >
              Change Credentials?
            </Button>
          </div>
        </Form>
      </Card>

      {/* --- UPDATE CREDENTIALS MODAL --- */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold px-3 pt-3">Update Credentials</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4 pt-3">
          <Form onSubmit={handleCredSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="text-muted small fw-bold">Company ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Company Id"
                value={credCompanyId}
                onChange={(e) => setCredCompanyId(e.target.value)}
                required
                className="rounded-3"
                disabled={credLoading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-muted small fw-bold">New Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter new username"
                value={credUsername}
                onChange={(e) => setCredUsername(e.target.value)}
                required
                className="rounded-3"
                disabled={credLoading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-muted small fw-bold">New Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showCredPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={credPassword}
                  onChange={(e) => setCredPassword(e.target.value)}
                  required
                  className="rounded-3 border-end-0"
                  style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                  disabled={credLoading}
                />
                <InputGroup.Text className="bg-white border-start-0 rounded-end-3">
                  <IconButton
                    onClick={toggleCredPasswordVisibility}
                    size="small"
                    style={{ padding: 0 }}
                    disabled={credLoading}
                  >
                    {showCredPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputGroup.Text>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="text-muted small fw-bold">Super Security Code</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your security code"
                value={credSecurityCode}
                onChange={(e) => setCredSecurityCode(e.target.value)}
                required
                className="rounded-3"
                disabled={credLoading}
              />
            </Form.Group>

            {credMessage.text && (
              <div className={`alert ${credMessage.type === 'error' ? 'alert-danger' : 'alert-success'} py-2`} role="alert">
                {credMessage.text}
              </div>
            )}

            <Button
              type="submit"
              className="w-100 rounded-3 mt-2"
              variant="primary"
              disabled={credLoading}
            >
              {credLoading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Updating...
                </>
              ) : (
                'Update Credentials'
              )}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

    </div>
  );
}