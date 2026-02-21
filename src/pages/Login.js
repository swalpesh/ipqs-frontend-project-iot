import { Form, Button, Card, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import logo from '../assets/logo.png';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

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

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

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

  return (
    <div className="login-background d-flex justify-content-center align-items-center vh-100">
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
            className="w-100 btn-lg rounded-4"
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
            <div className="text-danger text-center mt-3">
              {errorMsg}
            </div>
          )}
        </Form>
      </Card>
    </div>
  );
}