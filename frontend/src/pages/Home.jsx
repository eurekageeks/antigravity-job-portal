import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';

// MUI Icons
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CampaignIcon from '@mui/icons-material/Campaign';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import BrushIcon from '@mui/icons-material/Brush';
import SchoolIcon from '@mui/icons-material/School';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import WorkOutlineIcon from '@mui/icons-material/WorkOutlined';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import FlashOnIcon from '@mui/icons-material/FlashOn';

import featureImg1 from '../assets/feature_1.jpg';
import featureImg2 from '../assets/feature_2.jpg';
import featureImg3 from '../assets/feature_3.jpg';
import featureImg4 from '../assets/feature_4.jpg';

const API_BASE = import.meta.env.VITE_API_URL || 'http://35.90.136.27:5000/api';

const CATEGORIES = [
  { name: 'IT & Software', icon: LaptopMacIcon, color: '#0ea5e9', bg: '#e0f2fe' },
  { name: 'Finance', icon: AccountBalanceIcon, color: '#10b981', bg: '#d1fae5' },
  { name: 'Marketing', icon: CampaignIcon, color: '#f59e0b', bg: '#fef3c7' },
  { name: 'Sales', icon: TrendingUpIcon, color: '#ef4444', bg: '#fee2e2' },
  { name: 'HR', icon: PeopleIcon, color: '#8b5cf6', bg: '#ede9fe' },
  { name: 'Design', icon: BrushIcon, color: '#ec4899', bg: '#fce7f3' },
  { name: 'Education', icon: SchoolIcon, color: '#14b8a6', bg: '#ccfbf1' },
  { name: 'Healthcare', icon: LocalHospitalIcon, color: '#f97316', bg: '#ffedd5' },
];

function JobCard({ job }) {
  const salary = job.salary_min && job.salary_max
    ? `${(job.salary_min/100000).toFixed(1)} - ${(job.salary_max/100000).toFixed(1)}L PA`
    : 'Not disclosed';
  const exp = job.experience_min === 0 && job.experience_max === 0
    ? 'Fresher' : `${job.experience_min}-${job.experience_max} Yrs`;
  const skills = Array.isArray(job.skills) ? job.skills : [];

  return (
    <Card 
      elevation={0} 
      sx={{
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        transition: 'all 0.3s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        bgcolor: '#ffffff',
        '&:hover': { 
          boxShadow: '0 12px 32px rgba(0,123,255,0.1)',
          borderColor: '#007bff',
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardActionArea component={Link} to={`/jobs/${job.id}`} sx={{ flexGrow:1, display:'flex', flexDirection:'column', alignItems:'stretch' }}>
        <CardContent sx={{ p: 3, flexGrow:1, display:'flex', flexDirection:'column' }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'flex-start' }}>
            <Avatar sx={{ width: 52, height: 52, bgcolor: '#f8fafc', color: '#007bff', border: '1px solid #e2e8f0', fontWeight: 700 }}>
              {job.company_name?.[0]?.toUpperCase() || 'C'}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.15rem', lineHeight: 1.2, mb: 0.5 }}>
                {job.title}
              </Typography>
              <Typography sx={{ color: '#007bff', fontSize: '0.9rem', fontWeight: 600 }}>
                {job.company_name}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, color: '#475569', fontSize: '0.85rem', mb: 2.5, flexWrap: 'wrap' }}>
            {exp === 'Fresher' && (
              <Chip label="Fresher Friendly" size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', borderRadius: '8px', fontWeight: 700 }} />
            )}
            <Chip icon={<LocationOnIcon style={{ fontSize: 16 }} />} label={job.work_mode || 'Remote/Onsite'} size="small" sx={{ bgcolor: '#f8fafc', color: '#475569', borderRadius: '8px', fontWeight: 500 }} />
            <Chip icon={<WorkOutlineIcon style={{ fontSize: 16 }} />} label={exp} size="small" sx={{ bgcolor: '#f8fafc', color: '#475569', borderRadius: '8px', fontWeight: 500 }} />
            <Chip icon={<CurrencyRupeeIcon style={{ fontSize: 16 }} />} label={salary} size="small" sx={{ bgcolor: '#f8fafc', color: '#475569', borderRadius: '8px', fontWeight: 500 }} />
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {skills.slice(0, 3).map((s, i) => (
              <Chip key={i} label={s} size="small" sx={{ bgcolor: '#eef2f6', color: '#334155', border: 'none', fontSize: '0.75rem', fontWeight: 600, borderRadius: '8px' }} />
            ))}
            {skills.length > 3 && <Chip size="small" label={`+${skills.length - 3}`} sx={{ bgcolor: '#f8fafc', color: '#94a3b8', border: 'none', fontSize: '0.75rem', fontWeight: 600, borderRadius: '8px' }} />}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto', pt: 2, borderTop: '1px solid #f1f5f9' }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
              {job.last_date ? `Apply by ${new Date(job.last_date).toLocaleDateString('en-IN')}` : 'Actively hiring'}
            </Typography>
            <Button variant="outlined" size="small" sx={{ color: '#007bff', borderColor: '#007bff', textTransform: 'none', fontWeight: 700, borderRadius: '12px', px: 2, '&:hover': { bgcolor: '#eef2f6' } }}>
              View Job
            </Button>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default function Home() {
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/jobs?limit=8`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setFeaturedJobs(Array.isArray(d) ? d.slice(0, 8) : []))
      .catch(() => setFeaturedJobs([]))
      .finally(() => setJobsLoading(false));
  }, []);

  return (
    <Box sx={{ bgcolor: '#ffffff', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      {/* ═══ HERO SECTION ═══════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: '#eef2f6', pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 12 }, textAlign: 'center' }}>
        <Container maxWidth="md">
          <Chip label="🎉 The #1 Job Portal for Freshers" sx={{ bgcolor: '#ffffff', color: '#007bff', fontWeight: 800, mb: 4, px: 2, py: 2.5, borderRadius: '50px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: '0.95rem' }} />
          
          <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, fontWeight: 900, color: '#0f172a', mb: 3, lineHeight: 1.15, letterSpacing: '-0.02em' }}>
            Kickstart Your Career.<br />
            <Box component="span" sx={{ color: '#007bff' }}>Find Your First Job</Box> Today.
          </Typography>
          
          <Typography sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' }, color: '#475569', mb: 6, fontWeight: 500, maxWidth: '800px', mx: 'auto', lineHeight: 1.6 }}>
            No experience? No problem. We connect fresh graduates with top companies looking for entry-level talent across India.
          </Typography>

          {/* Search Pill */}
          <Paper elevation={0} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, p: 1, borderRadius: { xs: '24px', sm: '50px' }, gap: 1, mx: 'auto', maxWidth: '800px', boxShadow: '0 12px 40px rgba(0,0,0,0.08)', bgcolor: 'white', border: '2px solid #000000' }}>
            <TextField
              fullWidth
              placeholder="Job title, skills, or company"
              variant="outlined"
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
                sx: { '& fieldset': { border: 'none' }, bgcolor: 'transparent', fontSize: '1.05rem', fontWeight: 500, height: { xs: 50, sm: 60 } }
              }}
            />
            <Box sx={{ width: '1px', bgcolor: '#e2e8f0', my: 1, display: { xs: 'none', sm: 'block' } }} />
            <TextField
              fullWidth
              placeholder="City or Remote"
              variant="outlined"
              InputProps={{
                startAdornment: <InputAdornment position="start"><LocationOnIcon sx={{ color: '#94a3b8' }} /></InputAdornment>,
                sx: { '& fieldset': { border: 'none' }, bgcolor: 'transparent', fontSize: '1.05rem', fontWeight: 500, height: { xs: 50, sm: 60 } }
              }}
            />
            <Button
              variant="contained"
              component={Link}
              to="/jobs"
              sx={{
                bgcolor: '#007bff', color: 'white', px: 5, borderRadius: { xs: '16px', sm: '50px' }, fontWeight: 700, textTransform: 'none', fontSize: '1.1rem', whiteSpace: 'nowrap', boxShadow: 'none', '&:hover': { bgcolor: '#0056b3' }, height: { xs: 50, sm: 60 }
              }}
            >
              Search Jobs
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* ═══ LATEST JOBS ═══════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #f1f5f9' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 6, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' }, fontWeight: 800, color: '#0f172a', mb: 1 }}>Latest Fresher Jobs</Typography>
              <Typography sx={{ color: '#64748b', fontSize: '1.1rem' }}>Recently posted jobs waiting for your application.</Typography>
            </Box>
            <Button component={Link} to="/jobs" endIcon={<ArrowForwardIcon />} sx={{ color: '#007bff', fontWeight: 700, textTransform: 'none', fontSize: '1.05rem', bgcolor: '#eef2f6', borderRadius: '50px', px: 3, py: 1.5, '&:hover': { bgcolor: '#e2e8f0' } }}>
              View All Jobs
            </Button>
          </Box>

          {jobsLoading ? (
            <Grid container spacing={4}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Skeleton variant="rounded" height={280} sx={{ borderRadius: '20px' }} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={4}>
              {featuredJobs.map(job => (
                <Grid item xs={12} sm={6} md={3} key={job.id}>
                  <JobCard job={job} />
                </Grid>
              ))}
              {featuredJobs.length === 0 && (
                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: '24px', bgcolor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                    <Typography sx={{ fontSize: '1.2rem', color: '#64748b', fontWeight: 600 }}>No jobs found right now.</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          )}
        </Container>
      </Box>

      {/* ═══ CATEGORIES ═══════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: '#f8fafc' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' }, fontWeight: 800, color: '#0f172a', mb: 2 }}>Explore Fresher Roles</Typography>
            <Typography sx={{ color: '#64748b', fontSize: '1.1rem' }}>Discover entry-level opportunities across various industries.</Typography>
          </Box>

          <Grid container spacing={3}>
            {CATEGORIES.map((cat, idx) => (
              <Grid item xs={6} sm={3} key={idx}>
                <Paper component={Link} to="/jobs" elevation={0} sx={{ p: { xs: 2, sm: 4 }, borderRadius: '24px', textAlign: 'center', border: '1px solid #e2e8f0', bgcolor: '#ffffff', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all 0.3s ease', '&:hover': { borderColor: cat.color, transform: 'translateY(-5px)', boxShadow: `0 12px 24px ${cat.bg}` } }}>
                  <Box sx={{ mx: 'auto', width: 64, height: 64, borderRadius: '50%', bgcolor: cat.bg, color: cat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                    <cat.icon sx={{ fontSize: 32 }} />
                  </Box>
                  <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.95rem', sm: '1.1rem' }, color: '#0f172a', textAlign: 'center' }}>{cat.name}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ═══ WHY FIRSTJOB (4 Images Square) ═══════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: '#ffffff', py: { xs: 8, md: 10 }, borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.5rem' }, fontWeight: 800, color: '#0f172a', mb: 2 }}>Why Choose FirstJob?</Typography>
            <Typography sx={{ color: '#64748b', fontSize: '1.1rem' }}>We designed this platform exclusively for graduates.</Typography>
          </Box>
          <Grid container spacing={3} sx={{ maxWidth: '480px', mx: 'auto', justifyContent: 'center' }}>
            <Grid item xs={6}>
              <Paper elevation={0} sx={{ overflow: 'hidden', borderRadius: '24px', border: '1px solid #e2e8f0', aspectRatio: '1/1', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' } }}>
                <img src={featureImg1} alt="Zero Experience Needed" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper elevation={0} sx={{ overflow: 'hidden', borderRadius: '24px', border: '1px solid #e2e8f0', aspectRatio: '1/1', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' } }}>
                <img src={featureImg2} alt="Verified Top Companies" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper elevation={0} sx={{ overflow: 'hidden', borderRadius: '24px', border: '1px solid #e2e8f0', aspectRatio: '1/1', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' } }}>
                <img src={featureImg3} alt="Fast Responses" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper elevation={0} sx={{ overflow: 'hidden', borderRadius: '24px', border: '1px solid #e2e8f0', aspectRatio: '1/1', transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.05)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' } }}>
                <img src={featureImg4} alt="Career Growth" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ═══ BOTTOM CTA ═══════════════════════════════════════════════ */}
      <Box sx={{ bgcolor: '#007bff', py: { xs: 8, md: 10 }, textAlign: 'center', color: '#ffffff' }}>
        <Container maxWidth="md">
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 900, mb: 3 }}>
            Ready to Land Your First Job?
          </Typography>
          <Typography sx={{ fontSize: '1.1rem', opacity: 0.9, mb: 5, maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}>
            Join thousands of students and fresh graduates who have already found their dream roles through FirstJob.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button component={Link} to="/register" variant="contained" sx={{ bgcolor: '#ffffff', color: '#007bff', fontWeight: 800, fontSize: '1.1rem', textTransform: 'none', px: 6, py: 2, borderRadius: '50px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', '&:hover': { bgcolor: '#f8fafc' } }}>
              Create Free Account
            </Button>
            <Button component={Link} to="/jobs" variant="outlined" sx={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '1.1rem', textTransform: 'none', px: 6, py: 2, borderRadius: '50px', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: '#ffffff' } }}>
              Browse Jobs
            </Button>
          </Box>
        </Container>
      </Box>

    </Box>
  );
}
