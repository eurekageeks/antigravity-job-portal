import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { safeJson } from '../utils/api';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Divider,
  Chip,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import WorkOffIcon from '@mui/icons-material/WorkOff';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [jobType, setJobType] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [experienceMax, setExperienceMax] = useState('');
  const [skill, setSkill] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (jobType) params.append('job_type', jobType);
      if (workMode) params.append('work_mode', workMode);
      if (salaryMin) params.append('salary_min', salaryMin);
      if (experienceMax !== '') params.append('experience_max', experienceMax);
      if (skill) params.append('skill', skill);

      const response = await fetch(`/api/jobs?${params.toString()}`);
      if (response.ok) {
        const data = await safeJson(response);
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [jobType, workMode, salaryMin, experienceMax]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const resetFilters = () => {
    setSearch('');
    setJobType('');
    setWorkMode('');
    setSalaryMin('');
    setExperienceMax('');
    setSkill('');
    setTimeout(() => fetchJobs(), 100);
  };

  return (
    <Box sx={{ bgcolor: '#f0f9ff', minHeight: '100vh', py: 4, fontFamily: "'Inter', sans-serif" }}>
      <Container maxWidth="xl">
        <Grid container spacing={3} sx={{ display: 'flex', gap: '24px', flexWrap: 'nowrap', flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Left Sidebar (Filters) */}
          <Grid item sx={{ width: { xs: '100%', md: '280px' }, flexShrink: 0 }}>
            <Paper
              elevation={0}
              sx={{
                p: '20px',
                borderRadius: '12px',
                position: { md: 'sticky' },
                top: 80,
                border: '1px solid #e0f2fe',
                bgcolor: '#ffffff'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FilterListIcon sx={{ color: '#0f172a' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '18px' }}>
                    Filters
                  </Typography>
                </Box>
                <Button
                  onClick={resetFilters}
                  sx={{ color: '#0288d1', textTransform: 'none', fontWeight: 600, fontSize: '14px' }}
                  size="small"
                >
                  Clear All
                </Button>
              </Box>
              <Divider sx={{ mb: 3, borderColor: '#e0f2fe' }} />

              {/* Skill / Keyword */}
              <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '14px', mb: 1 }}>
                Skills / Keywords
              </Typography>
              <Divider sx={{ mb: 2, borderColor: '#e0f2fe' }} />
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="e.g. React, Node, SQL"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                onBlur={fetchJobs}
                sx={{ mb: 3, bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />

              {/* Job Type */}
              <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '14px', mb: 1 }}>
                Job Type
              </Typography>
              <Divider sx={{ mb: 2, borderColor: '#e0f2fe' }} />
              <FormGroup sx={{ mb: 3 }}>
                {['Full Time', 'Part Time', 'Internship', 'Contract'].map((type) => (
                  <FormControlLabel
                    key={type}
                    control={
                      <Checkbox
                        size="small"
                        checked={jobType === type}
                        onChange={(e) => setJobType(e.target.checked ? type : '')}
                        sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#0288d1' } }}
                      />
                    }
                    label={<Typography sx={{ fontSize: '14px', color: '#475569' }}>{type}</Typography>}
                  />
                ))}
              </FormGroup>

              {/* Work Mode */}
              <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '14px', mb: 1 }}>
                Work Mode
              </Typography>
              <Divider sx={{ mb: 2, borderColor: '#e0f2fe' }} />
              <FormGroup sx={{ mb: 3 }}>
                {['Remote', 'Onsite', 'Hybrid'].map((mode) => (
                  <FormControlLabel
                    key={mode}
                    control={
                      <Checkbox
                        size="small"
                        checked={workMode === mode}
                        onChange={(e) => setWorkMode(e.target.checked ? mode : '')}
                        sx={{ color: '#94a3b8', '&.Mui-checked': { color: '#0288d1' } }}
                      />
                    }
                    label={<Typography sx={{ fontSize: '14px', color: '#475569' }}>{mode}</Typography>}
                  />
                ))}
              </FormGroup>

              {/* Experience */}
              <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '14px', mb: 1 }}>
                Experience (Years)
              </Typography>
              <Divider sx={{ mb: 2, borderColor: '#e0f2fe' }} />
              <Slider
                color="primary"
                value={experienceMax === '' ? 15 : Number(experienceMax)}
                onChange={(e, val) => setExperienceMax(val)}
                min={0}
                max={15}
                valueLabelDisplay="auto"
                sx={{ color: '#0288d1', mb: 3 }}
              />

              {/* Salary */}
              <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '14px', mb: 1 }}>
                Min Salary
              </Typography>
              <Divider sx={{ mb: 2, borderColor: '#e0f2fe' }} />
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                type="number"
                placeholder="e.g. 50000"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                sx={{ mb: 1, bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Paper>
          </Grid>

          {/* Right Main Area (Jobs) */}
          <Grid item sx={{ flex: 1, minWidth: 0 }}>
            {/* Search Bar */}
            <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 4, display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Search jobs by title, keyword, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                  bgcolor: '#fff',
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-root': { borderRadius: '8px', height: '48px' }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  )
                }}
              />
              <Button
                type="submit"
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #0288d1, #0ea5e9)',
                  px: 4,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '16px',
                  height: '48px',
                  boxShadow: 'none'
                }}
              >
                Search
              </Button>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ color: '#0f172a', fontSize: '16px', fontWeight: 600 }}>
                {jobs.length} Jobs Found
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress sx={{ color: '#0288d1' }} />
              </Box>
            ) : jobs.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '12px', border: '1px solid #e0f2fe', boxShadow: 'none', bgcolor: '#fff' }}>
                <WorkOffIcon sx={{ fontSize: 64, color: '#0288d1', mb: 2 }} />
                <Typography variant="h6" sx={{ color: '#0f172a', mb: 1, fontWeight: 700 }}>
                  No jobs found
                </Typography>
                <Typography sx={{ color: '#475569' }}>
                  Try expanding your search or adjusting the filters.
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {jobs.map((job) => (
                  <Paper
                    key={job.id}
                    elevation={0}
                    sx={{
                      p: '20px',
                      borderRadius: '12px',
                      border: '1px solid #e0f2fe',
                      bgcolor: '#ffffff',
                      transition: 'all 0.2s ease-in-out',
                      boxShadow: '0 2px 12px rgba(2,136,209,0.10)',
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: 3,
                      '&:hover': {
                        boxShadow: '0 8px 28px rgba(2,136,209,0.20)',
                        borderColor: '#0288d1',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 3, flex: 1, minWidth: 0, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <Avatar
                        src={job.company_logo}
                        alt={job.company_name}
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '8px',
                          bgcolor: '#e0f7fa',
                          color: '#0288d1',
                          fontSize: '18px',
                          fontWeight: 700,
                          border: 'none'
                        }}
                      >
                        {job.company_name?.charAt(0) || 'C'}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          component={Link}
                          to={`/jobs/${job.id}`}
                          sx={{
                            color: '#0f172a',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            textDecoration: 'none',
                            display: 'block',
                            mb: 0.5,
                            '&:hover': { color: '#0288d1' }
                          }}
                        >
                          {job.title}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1.5, alignItems: 'center' }}>
                          <Typography sx={{ color: '#475569', fontSize: '14px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <BusinessCenterIcon sx={{ fontSize: 14 }} /> {job.company_name}
                          </Typography>
                          <Typography sx={{ color: '#475569', fontSize: '14px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LocationOnIcon sx={{ fontSize: 14 }} /> {job.work_mode}
                          </Typography>
                          <Typography sx={{ color: '#10b981', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CurrencyRupeeIcon sx={{ fontSize: 14 }} /> ₹{parseFloat(job.salary_min).toLocaleString('en-IN')} - ₹{parseFloat(job.salary_max).toLocaleString('en-IN')}
                          </Typography>
                          <Typography sx={{ color: '#94a3b8', fontSize: '14px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 14 }} /> {job.last_date ? `${Math.floor((new Date(job.last_date) - new Date()) / (1000 * 60 * 60 * 24))} Days left` : 'Open'}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {Array.isArray(job.skills) && job.skills.map((skill, idx) => (
                            <Chip
                              key={idx}
                              label={skill}
                              size="small"
                              sx={{
                                bgcolor: '#e0f7fa',
                                color: '#01579b',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 500,
                                border: 'none'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'row', sm: 'column' }, alignItems: { xs: 'center', sm: 'flex-end' }, justifyContent: 'center', gap: 2, minWidth: '120px' }}>
                      <Button
                        component={Link}
                        to={`/jobs/${job.id}`}
                        variant="contained"
                        sx={{
                          background: 'linear-gradient(135deg, #f97316, #fb923c)',
                          color: '#fff',
                          textTransform: 'none',
                          fontWeight: 600,
                          borderRadius: '8px',
                          px: 3,
                          boxShadow: 'none',
                          width: { xs: '100%', sm: 'auto' }
                        }}
                      >
                        Apply
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<BookmarkBorderIcon />}
                        sx={{
                          color: '#0288d1',
                          borderColor: '#0288d1',
                          textTransform: 'none',
                          fontWeight: 600,
                          borderRadius: '8px',
                          width: { xs: '100%', sm: 'auto' },
                          '&:hover': {
                            borderColor: '#01579b',
                            bgcolor: '#f0f9ff'
                          }
                        }}
                      >
                        Save
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
