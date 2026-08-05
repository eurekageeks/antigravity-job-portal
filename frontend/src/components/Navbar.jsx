import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpg';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import WorkOutlineIcon from '@mui/icons-material/WorkOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); setDrawerOpen(false); };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'employer') return '/employer';
    return '/candidate';
  };

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{
        bgcolor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <Toolbar sx={{
          maxWidth: 1280, width: '100%', mx: 'auto',
          px: { xs: 2, md: 4 },
          minHeight: 'auto', py: 1,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img src={logo} alt="FirstJob" style={{ height: 50, width: 'auto', objectFit: 'contain', display: 'block' }} />
          </Link>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 4, flexGrow: 1, ml: 6 }}>
            <Button
              component={Link} to="/jobs"
              sx={{ color: '#1e293b', fontWeight: 600, textTransform: 'none', fontSize: '0.95rem', '&:hover': { color: '#007bff', bgcolor: 'transparent' } }}
            >
              Find Jobs
            </Button>

            {user && (
              <Button
                component={Link} to={getDashboardPath()}
                sx={{ color: '#1e293b', fontWeight: 600, textTransform: 'none', fontSize: '0.95rem', '&:hover': { color: '#007bff', bgcolor: 'transparent' } }}
              >
                Dashboard
              </Button>
            )}
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  component={Link} to={getDashboardPath()}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none',
                    pr: 1, py: 0.5,
                  }}
                >
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#007bff', fontSize: '0.9rem' }}>
                      {user.name?.[0]?.toUpperCase()}
                    </Avatar>
                    {user.name}
                  </Typography>
                </Box>
                <IconButton
                  onClick={handleLogout}
                  size="small"
                  sx={{ color: '#ef4444', bgcolor: 'rgba(239,68,68,0.1)', '&:hover': { bgcolor: 'rgba(239,68,68,0.2)' }, borderRadius: '8px', p: 1 }}
                >
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  component={Link} to="/login"
                  sx={{
                    color: '#1e293b', fontWeight: 600, textTransform: 'none', fontSize: '0.95rem',
                    '&:hover': { color: '#007bff', bgcolor: 'transparent' }
                  }}
                >
                  Sign In
                </Button>
                <Button
                  component={Link} to="/register"
                  variant="contained"
                  sx={{
                    bgcolor: '#007bff', color: '#ffffff', fontWeight: 700, textTransform: 'none', fontSize: '0.95rem',
                    borderRadius: '24px', px: 4, py: 1, boxShadow: '0 4px 12px rgba(0,123,255,0.2)',
                    '&:hover': { bgcolor: '#0056b3', boxShadow: '0 6px 16px rgba(0,123,255,0.3)' }
                  }}
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>

          <IconButton
            sx={{ display: { xs: 'flex', md: 'none' }, color: '#1e293b' }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 280, bgcolor: '#ffffff' } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #e2e8f0' }}>
          <img src={logo} alt="FirstJob" style={{ height: 40, width: 'auto' }} />
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: '#1e293b' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <List sx={{ py: 2 }}>
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/jobs" onClick={() => setDrawerOpen(false)} sx={{ py: 1.5 }}>
              <WorkOutlineIcon sx={{ color: '#007bff', mr: 2 }} />
              <ListItemText primary="Find Jobs" primaryTypographyProps={{ fontWeight: 600, color: '#1e293b' }} />
            </ListItemButton>
          </ListItem>
          {user && (
            <ListItem disablePadding>
              <ListItemButton component={Link} to={getDashboardPath()} onClick={() => setDrawerOpen(false)} sx={{ py: 1.5 }}>
                <DashboardIcon sx={{ color: '#007bff', mr: 2 }} />
                <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: 600, color: '#1e293b' }} />
              </ListItemButton>
            </ListItem>
          )}
        </List>

        <Divider />

        <Box sx={{ p: 2 }}>
          {user ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: '#007bff' }}>{user.name?.[0]?.toUpperCase()}</Avatar>
                <Box>
                  <Typography fontWeight={600} sx={{ color: '#1e293b' }}>{user.name}</Typography>
                  <Typography sx={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'capitalize' }}>{user.role}</Typography>
                </Box>
              </Box>
              <Button fullWidth variant="outlined" onClick={handleLogout} startIcon={<LogoutIcon />}
                sx={{ color: '#ef4444', borderColor: '#ef4444', textTransform: 'none', fontWeight: 600, borderRadius: '24px' }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button fullWidth component={Link} to="/login" onClick={() => setDrawerOpen(false)}
                sx={{ color: '#1e293b', textTransform: 'none', fontWeight: 600, borderRadius: '24px', py: 1 }}
              >
                Sign In
              </Button>
              <Button fullWidth component={Link} to="/register" variant="contained" onClick={() => setDrawerOpen(false)}
                sx={{ bgcolor: '#007bff', color: '#ffffff', textTransform: 'none', fontWeight: 600, borderRadius: '24px', py: 1, boxShadow: 'none' }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
}
