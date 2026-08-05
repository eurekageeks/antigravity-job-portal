import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { safeJson } from '../utils/api';
import GoogleLoginButton from '../components/GoogleLoginButton';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import SchoolIcon from '@mui/icons-material/School';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [showPwd,    setShowPwd]    = useState(false);
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [googleRole, setGoogleRole] = useState('candidate');

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res  = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email, password }) });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.message || 'Login failed');
      login(data.token, data.user);
      if (data.user.role==='admin') navigate('/admin');
      else if (data.user.role==='employer') navigate('/employer');
      else navigate('/candidate');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const onGoogleSuccess = (user) => {
    if (user.role==='admin') navigate('/admin');
    else if (user.role==='employer') navigate('/employer');
    else navigate('/candidate');
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#eef2f6',
      py: 4,
      px: 2,
      fontFamily: "'Inter', sans-serif"
    }}>
      <Card sx={{
        width: '100%',
        maxWidth: 440,
        mx: 'auto',
        borderRadius: '24px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
        bgcolor: '#ffffff',
        p: { xs: 3, sm: 4 }
      }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <SchoolIcon sx={{ fontSize: 36, color: '#007bff' }} />
            </Box>
          </Box>
          <Typography sx={{ color: '#0f172a', fontSize: '1.75rem', fontWeight: 800, textAlign: 'center', mb: 1 }}>
            Sign In
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '0.95rem', mb: 4, textAlign: 'center' }}>
            Welcome back to FirstJob
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', mb: 1 }}>
                Email Address
              </Typography>
              <TextField
                placeholder="Enter your email"
                type="email"
                required
                fullWidth
                size="medium"
                variant="outlined"
                value={email}
                onChange={e => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                    '&.Mui-focused fieldset': { borderColor: '#007bff' },
                  }
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', mb: 1 }}>
                Password
              </Typography>
              <TextField
                placeholder="Enter your password"
                type={showPwd ? 'text' : 'password'}
                required
                fullWidth
                size="medium"
                variant="outlined"
                value={password}
                onChange={e => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPwd(p => !p)} edge="end">
                        {showPwd ? <VisibilityOffIcon sx={{ color: '#94a3b8' }} /> : <VisibilityIcon sx={{ color: '#94a3b8' }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: '#f8fafc',
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                    '&.Mui-focused fieldset': { borderColor: '#007bff' },
                  }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Typography component={Link} to="#" sx={{ color: '#007bff', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 600 }}>
                  Forgot Password?
                </Typography>
              </Box>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              endIcon={<ArrowForwardIcon />}
              sx={{
                backgroundColor: '#007bff',
                color: '#fff',
                height: 48,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '1rem',
                borderRadius: '24px',
                boxShadow: '0 4px 14px rgba(0,123,255,0.4)',
                mt: 1,
                '&:hover': { backgroundColor: '#0056b3' },
                '&:disabled': { opacity: 0.7 }
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>OR</Typography>
          </Divider>

          <Box sx={{ mb: 2 }}>
            <Typography sx={{ color: '#475569', fontSize: '0.85rem', mb: 1, textAlign: 'center', fontWeight: 500 }}>
              Sign in with Google as:
            </Typography>
            <ToggleButtonGroup
              value={googleRole}
              exclusive
              onChange={(_, v) => v && setGoogleRole(v)}
              fullWidth
              size="small"
              sx={{
                mb: 2,
                gap: 1,
                '& .MuiToggleButtonGroup-grouped': {
                  border: '1px solid #e2e8f0 !important',
                  borderRadius: '12px !important',
                  '&.Mui-selected': {
                    backgroundColor: '#e0f2fe',
                    color: '#007bff',
                    borderColor: '#007bff !important'
                  }
                }
              }}
            >
              <ToggleButton value="candidate" sx={{ textTransform: 'none', py: 0.75, fontWeight: 600 }}>
                <PersonIcon sx={{ mr: 1, fontSize: 20 }} /> Candidate
              </ToggleButton>
              <ToggleButton value="employer" sx={{ textTransform: 'none', py: 0.75, fontWeight: 600 }}>
                <BusinessIcon sx={{ mr: 1, fontSize: 20 }} /> Employer
              </ToggleButton>
            </ToggleButtonGroup>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <GoogleLoginButton role={googleRole} onSuccess={onGoogleSuccess} onError={setError} />
            </Box>
          </Box>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#007bff', fontWeight: 700, textDecoration: 'none' }}>
                Register Free
              </Link>
            </Typography>
          </Box>

        </CardContent>
      </Card>
    </Box>
  );
}
