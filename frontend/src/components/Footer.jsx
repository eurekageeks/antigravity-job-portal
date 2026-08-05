import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';

import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';


export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: '#0f172a', color: '#ffffff', position: 'relative' }}>
      {/* Sky blue gradient strip at very top */}
      <Box sx={{ height: '4px', width: '100%', background: 'linear-gradient(135deg, #0288d1, #0ea5e9)' }} />
      
      <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, md: 4 }, pt: 8, pb: 4, fontFamily: 'Inter, sans-serif' }}>
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* FirstJob Column */}
          <Grid item xs={12} md={3}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#ffffff', mb: 2 }}>FirstJob</Typography>
            <Typography variant="body2" sx={{ color: '#e0f2fe', lineHeight: 1.6, mb: 3 }}>
              India's smart recruitment platform connecting ambitious talent with verified employers, offering seamless job matching and status tracking.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton sx={{ color: '#ffffff', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: '#0288d1' } }}>
                <LinkedInIcon />
              </IconButton>
              <IconButton sx={{ color: '#ffffff', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: '#0288d1' } }}>
                <TwitterIcon />
              </IconButton>
              <IconButton sx={{ color: '#ffffff', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: '#0288d1' } }}>
                <FacebookIcon />
              </IconButton>
              <IconButton sx={{ color: '#ffffff', bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: '#0288d1' } }}>
                <InstagramIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* For Candidates */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: '#0288d1' }}>For Candidates</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Link href="/jobs" underline="none" sx={{ color: '#ffffff', fontSize: '0.9rem', '&:hover': { color: '#0ea5e9' } }}>Browse Jobs</Link>
              <Link href="/register" underline="none" sx={{ color: '#ffffff', fontSize: '0.9rem', '&:hover': { color: '#0ea5e9' } }}>Create Profile</Link>
              <Link href="/login" underline="none" sx={{ color: '#ffffff', fontSize: '0.9rem', '&:hover': { color: '#0ea5e9' } }}>Job Alerts</Link>
            </Box>
          </Grid>

          {/* For Employers */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: '#0288d1' }}>For Employers</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Link href="/register" underline="none" sx={{ color: '#ffffff', fontSize: '0.9rem', '&:hover': { color: '#0ea5e9' } }}>Register Company</Link>
              <Link href="/login" underline="none" sx={{ color: '#ffffff', fontSize: '0.9rem', '&:hover': { color: '#0ea5e9' } }}>Post a Job</Link>
              <Link href="/login" underline="none" sx={{ color: '#ffffff', fontSize: '0.9rem', '&:hover': { color: '#0ea5e9' } }}>Dashboard</Link>
            </Box>
          </Grid>

          {/* Quick Links / Connect */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3, color: '#0288d1' }}>Quick Links</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#ffffff' }}>
                <EmailIcon fontSize="small" sx={{ color: '#0ea5e9' }} />
                <Typography variant="body2">support@firstjob.com</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#ffffff' }}>
                <PhoneIcon fontSize="small" sx={{ color: '#0ea5e9' }} />
                <Typography variant="body2">+91 1800 123 4567</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#ffffff' }}>
                <LocationOnIcon fontSize="small" sx={{ color: '#0ea5e9' }} />
                <Typography variant="body2">Tech Park, Bengaluru, India</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: '#94a3b8', fontSize: '0.8rem' }}>
            &copy; {new Date().getFullYear()} First Job Platform. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="#" underline="none" sx={{ color: '#94a3b8', fontSize: '0.8rem', '&:hover': { color: '#ffffff' } }}>Privacy Policy</Link>
            <Link href="#" underline="none" sx={{ color: '#94a3b8', fontSize: '0.8rem', '&:hover': { color: '#ffffff' } }}>Terms of Service</Link>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
