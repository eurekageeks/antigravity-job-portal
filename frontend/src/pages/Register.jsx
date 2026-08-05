import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolIcon from '@mui/icons-material/School';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role,        setRole]        = useState('candidate');
  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [company,     setCompany]     = useState('');
  const [showPwd,     setShowPwd]     = useState(false);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [loading,     setLoading]     = useState(false);

  useEffect(() => {
    const r = searchParams.get('role');
    if (r && ['candidate','employer'].includes(r)) setRole(r);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true);
    try {
      const payload = { email, password, name, role, ...(role==='employer' && { company_name: company }) };
      const res  = await fetch('/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setSuccess(data.message);
      setName(''); setEmail(''); setPassword(''); setCompany('');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef2f6', p: 3 }}>
        <Card sx={{ maxWidth: 480, width: '100%', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.05)', textAlign: 'center', bgcolor: '#ffffff' }}>
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: '#10b981', mb: 3 }} />
            <Typography sx={{ color: '#0f172a', fontSize: '1.75rem', fontWeight: 800, mb: 1 }}>
              Registration Complete!
            </Typography>
            <Typography sx={{ color: '#64748b', mb: 4 }}>{success}</Typography>
            <Button
              component={Link} to="/login" variant="contained" fullWidth
              sx={{
                backgroundColor: '#007bff', color: '#fff', textTransform: 'none', py: 1.5, fontWeight: 700, borderRadius: '24px',
                boxShadow: '0 4px 14px rgba(0,123,255,0.4)',
                '&:hover': { backgroundColor: '#0056b3' }
              }}
            >
              Go to Sign In
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: '#f8fafc',
      '& fieldset': { borderColor: '#e2e8f0' },
      '&:hover fieldset': { borderColor: '#cbd5e1' },
      '&.Mui-focused fieldset': { borderColor: '#007bff' },
    }
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
        maxWidth: 520,
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
          <Typography sx={{ color: '#0f172a', fontSize: '1.75rem', fontWeight: 800, mb: 1, textAlign: 'center' }}>
            Create Account
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '0.95rem', mb: 4, textAlign: 'center' }}>
            Join FirstJob to jumpstart your career
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <Box
              onClick={() => setRole('candidate')}
              sx={{
                flex: 1,
                border: role === 'candidate' ? '2px solid #007bff' : '1px solid #e2e8f0',
                borderRadius: '16px',
                p: 2,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                bgcolor: role === 'candidate' ? '#f0f7ff' : '#ffffff',
                transition: 'all 0.2s',
                boxShadow: role === 'candidate' ? '0 4px 12px rgba(0,123,255,0.1)' : 'none'
              }}
            >
              <PersonIcon sx={{ fontSize: 32, color: role === 'candidate' ? '#007bff' : '#94a3b8' }} />
              <Typography sx={{ fontWeight: 700, color: role === 'candidate' ? '#007bff' : '#475569' }}>
                Candidate
              </Typography>
            </Box>
            <Box
              onClick={() => setRole('employer')}
              sx={{
                flex: 1,
                border: role === 'employer' ? '2px solid #007bff' : '1px solid #e2e8f0',
                borderRadius: '16px',
                p: 2,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                bgcolor: role === 'employer' ? '#f0f7ff' : '#ffffff',
                transition: 'all 0.2s',
                boxShadow: role === 'employer' ? '0 4px 12px rgba(0,123,255,0.1)' : 'none'
              }}
            >
              <BusinessIcon sx={{ fontSize: 32, color: role === 'employer' ? '#007bff' : '#94a3b8' }} />
              <Typography sx={{ fontWeight: 700, color: role === 'employer' ? '#007bff' : '#475569' }}>
                Employer
              </Typography>
            </Box>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', mb: 1 }}>
                {role === 'employer' ? 'Recruiter Full Name' : 'Full Name'}
              </Typography>
              <TextField
                placeholder="Enter your name"
                required
                fullWidth
                size="medium"
                variant="outlined"
                value={name}
                onChange={e => setName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
                sx={textFieldStyles}
              />
            </Box>

            {role === 'employer' && (
              <Box>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', mb: 1 }}>
                  Company Name
                </Typography>
                <TextField
                  placeholder="Enter company name"
                  required
                  fullWidth
                  size="medium"
                  variant="outlined"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon sx={{ color: '#94a3b8' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={textFieldStyles}
                />
              </Box>
            )}

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
                sx={textFieldStyles}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155', mb: 1 }}>
                Password
              </Typography>
              <TextField
                placeholder="Create a password"
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
                sx={textFieldStyles}
              />
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
                mt: 1,
                boxShadow: '0 4px 14px rgba(0,123,255,0.4)',
                '&:hover': { backgroundColor: '#0056b3' },
                '&:disabled': { opacity: 0.7 }
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Box>

          <Divider sx={{ my: 4 }}>
            <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>OR</Typography>
          </Divider>

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <GoogleLoginButton
              role={role}
              onSuccess={user => navigate(user.role === 'employer' ? '/employer' : '/candidate')}
              onError={setError}
            />
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography sx={{ color: '#64748b', fontSize: '0.9rem' }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: '#007bff', fontWeight: 700, textDecoration: 'none' }}>
                Sign In
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
