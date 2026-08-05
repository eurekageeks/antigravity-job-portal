import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { safeJson } from '../../utils/api';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';

import BusinessIcon from '@mui/icons-material/Business';
import EditIcon from '@mui/icons-material/Edit';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import WorkOutlineIcon from '@mui/icons-material/WorkOutlined';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PeopleIcon from '@mui/icons-material/People';

const jobStatusChip = (status) => {
  const m = {
    approved:        { bg:'#10b981', color:'#ffffff', label:'Approved' },
    pending_approval:{ bg:'#f97316', color:'#ffffff', label:'Pending Approval' },
    rejected:        { bg:'#ef4444', color:'#ffffff', label:'Rejected' },
    closed:          { bg:'#64748b', color:'#ffffff', label:'Closed' },
  };
  const s = m[status] || m.pending_approval;
  return { chipSx: { bgcolor:s.bg, color:s.color, fontWeight:600, fontSize:'0.75rem', borderRadius:'8px' }, label: s.label };
};

const applicantStatusChip = (status) => {
  const m = {
    Selected:   { bg:'#10b981', color:'#ffffff' },
    Interview:  { bg:'#8b5cf6', color:'#ffffff' },
    Shortlisted:{ bg:'#f97316', color:'#ffffff' },
    Rejected:   { bg:'#ef4444', color:'#ffffff' },
  };
  const s = m[status] || { bg:'#0288d1', color:'#ffffff' };
  return { bgcolor:s.bg, color:s.color, fontWeight:600, fontSize:'0.75rem', borderRadius:'8px' };
};

export default function EmployerDashboard() {
  const { token, refreshProfile } = useAuth();

  const [activeTab, setActiveTab]   = useState('post-job');
  const [loading,   setLoading]     = useState(true);

  const [profile,    setProfile]    = useState({ company_name:'', logo:'', website:'', industry:'', description:'' });
  const [profileMsg, setProfileMsg] = useState({ type:'', text:'' });
  const [logoUploading, setLogoUploading] = useState(false);

  const [jobs,    setJobs]    = useState([]);
  const [postMsg, setPostMsg] = useState({ type:'', text:'' });
  const [newJob,  setNewJob]  = useState({
    title:'', description:'', skills:'', salary_min:'', salary_max:'',
    experience_min:'', experience_max:'', job_type:'Full Time', work_mode:'Remote',
    vacancies:'1', last_date:''
  });

  const [applicants,        setApplicants]        = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const fetchProfile    = async () => { try { const r = await fetch('/api/profiles/employer',{ headers:{Authorization:`Bearer ${token}`} }); if(r.ok) setProfile(await safeJson(r)); } catch(e){} };
  const fetchJobs       = async () => { try { const r = await fetch('/api/jobs/my-jobs',       { headers:{Authorization:`Bearer ${token}`} }); if(r.ok) setJobs(await safeJson(r)); }       catch(e){} };
  const fetchApplicants = async () => { try { const r = await fetch('/api/applications/employer',{ headers:{Authorization:`Bearer ${token}`} }); if(r.ok) setApplicants(await safeJson(r)); } catch(e){} };

  useEffect(() => {
    if (token) Promise.all([fetchProfile(), fetchJobs(), fetchApplicants()]).then(()=>setLoading(false));
  }, [token]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault(); setProfileMsg({type:'',text:''});
    try {
      const r = await fetch('/api/profiles/employer',{ method:'PUT', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`}, body:JSON.stringify(profile) });
      const d = await safeJson(r);
      setProfileMsg({ type: r.ok?'success':'error', text: d.message });
    } catch(e) { setProfileMsg({type:'error',text:'Server error'}); }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const r = await fetch('/api/profiles/upload-image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (r.ok) {
        const data = await r.json();
        setProfile(p => ({ ...p, logo: data.url || p.logo }));
        await fetchProfile();
        await refreshProfile();
      }
    } catch(err) { console.error('Logo upload error', err); }
    finally { setLogoUploading(false); }
  };

  const handlePostJob = async (e) => {
    e.preventDefault(); setPostMsg({type:'',text:''});
    try {
      const skillsArray = newJob.skills.split(',').map(s=>s.trim()).filter(Boolean);
      const r = await fetch('/api/jobs',{ method:'POST', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`}, body:JSON.stringify({...newJob,skills:skillsArray}) });
      const d = await safeJson(r);
      if (r.ok) {
        setPostMsg({type:'success',text:d.message});
        setNewJob({ title:'', description:'', skills:'', salary_min:'', salary_max:'', experience_min:'', experience_max:'', job_type:'Full Time', work_mode:'Remote', vacancies:'1', last_date:'' });
        fetchJobs();
      } else { setPostMsg({type:'error',text:d.message}); }
    } catch(e) { setPostMsg({type:'error',text:'Error posting job'}); }
  };

  const handleCloseJob = async (jobId) => {
    const r = await fetch(`/api/jobs/${jobId}`,{ method:'PUT', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`}, body:JSON.stringify({status:'closed'}) });
    if (r.ok) fetchJobs();
  };

  const handleUpdateStatus = async (appId, status) => {
    const r = await fetch(`/api/applications/${appId}/status`,{ method:'PUT', headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`}, body:JSON.stringify({status}) });
    if (r.ok) { fetchApplicants(); if(selectedApplicant?.id===appId) setSelectedApplicant(p=>({...p,status})); }
  };

  if (loading) return (
    <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:3, bgcolor: '#eef2f6' }}>
      <CircularProgress sx={{ color:'#007bff' }} size={44} thickness={4} />
      <Typography sx={{ color:'#475569', fontWeight:600, fontSize:'1rem' }}>Loading Employer Console…</Typography>
    </Box>
  );

  const activeJobs = jobs.filter(j=>j.status==='approved').length;
  const pendingJobs = jobs.filter(j=>j.status==='pending_approval').length;
  const totalApplicants = applicants.length;

  const tfProps = { 
    size: "medium", 
    variant: "outlined",
    hiddenLabel: true,
    sx: { 
      '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        bgcolor: '#f8fafc',
      }
    }
  };

  const cardStyle = {
    bgcolor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
    border: '1px solid #e2e8f0',
    p: 4,
    mb: 4
  };

  const InputWrapper = ({ label, children }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>{label}</Typography>
      {children}
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#eef2f6', minHeight: '100vh', py: 4, fontFamily: "'Inter', sans-serif" }}>
      <Container maxWidth="lg">
        {/* Hero Banner */}
        <Box sx={{ 
          bgcolor: '#007bff', 
          color: '#fff', 
          borderRadius: '24px', 
          p: { xs: 3, md: 5 }, 
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <label htmlFor="header-logo-upload" style={{ cursor:'pointer' }}>
                <Avatar src={profile.logo || profile.avatar_url} sx={{ width: 80, height: 80, border: '2px solid #fff', bgcolor: '#ffffff', color: '#007bff' }} variant="rounded">
                  {!profile.logo && !profile.avatar_url && <BusinessIcon fontSize="large" />}
                </Avatar>
                <Box sx={{ position: 'absolute', bottom: -8, right: -8, bgcolor: '#f97316', borderRadius: '50%', p: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {logoUploading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <CameraAltIcon sx={{ fontSize: 16, color: '#fff' }} />}
                </Box>
              </label>
              <input id="header-logo-upload" type="file" accept="image/*" style={{ display:'none' }} onChange={handleLogoUpload} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '2rem', fontWeight: 700 }}>Welcome back, {profile.company_name || 'Employer'}!</Typography>
              <Typography sx={{ fontSize: '1rem', opacity: 0.9 }}>Manage your job postings and applicants efficiently.</Typography>
            </Box>
          </Box>
        </Box>

        {/* Stats Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ ...cardStyle, p: 3, mb: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 2, bgcolor: '#e0f2fe', borderRadius: '12px', color: '#007bff' }}>
                <AssignmentTurnedInIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>{activeJobs}</Typography>
                <Typography sx={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Active Jobs</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ ...cardStyle, p: 3, mb: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 2, bgcolor: '#fff7ed', borderRadius: '12px', color: '#f97316' }}>
                <HourglassEmptyIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>{pendingJobs}</Typography>
                <Typography sx={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Pending Jobs</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={0} sx={{ ...cardStyle, p: 3, mb: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 2, bgcolor: '#f3e8ff', borderRadius: '12px', color: '#a855f7' }}>
                <PeopleIcon sx={{ fontSize: 32 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>{totalApplicants}</Typography>
                <Typography sx={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Total Applicants</Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Pill Tabs */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, overflowX: 'auto', pb: 1 }}>
          {[
            { id: 'post-job', label: 'Post Job' },
            { id: 'manage-jobs', label: 'Posted Jobs' },
            { id: 'applicants', label: 'Applicant Tracker' },
            { id: 'profile', label: 'Company Profile' }
          ].map(tab => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              sx={{
                borderRadius: '24px',
                px: 3, py: 1,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                bgcolor: activeTab === tab.id ? '#007bff' : '#fff',
                color: activeTab === tab.id ? '#fff' : '#475569',
                border: '1px solid',
                borderColor: activeTab === tab.id ? '#007bff' : '#e2e8f0',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(0,123,255,0.2)' : '0 2px 4px rgba(0,0,0,0.02)',
                '&:hover': { bgcolor: activeTab === tab.id ? '#0056b3' : '#f8fafc' },
                whiteSpace: 'nowrap'
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Box>

        {/* Tab Contents */}
        {activeTab === 'post-job' && (
          <Paper elevation={0} sx={cardStyle}>
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Post a New Job</Typography>
              <Typography sx={{ fontSize: '0.9rem', color: '#475569' }}>Fill out the form below to publish a new vacancy.</Typography>
            </Box>
            {postMsg.text && (
              <Alert severity={postMsg.type === 'success' ? 'success' : 'error'} sx={{ mb: 3, borderRadius: '12px' }}>{postMsg.text}</Alert>
            )}
            <Box component="form" onSubmit={handlePostJob} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <InputWrapper label="Job Title">
                    <TextField required fullWidth placeholder="e.g. Software Engineer" value={newJob.title} onChange={e=>setNewJob({...newJob,title:e.target.value})} {...tfProps} />
                  </InputWrapper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InputWrapper label="Skills (comma-separated)">
                    <TextField required fullWidth placeholder="e.g. React, Node.js, AWS" value={newJob.skills} onChange={e=>setNewJob({...newJob,skills:e.target.value})} {...tfProps} />
                  </InputWrapper>
                </Grid>
                <Grid item xs={12}>
                  <InputWrapper label="Job Description">
                    <TextField required fullWidth multiline rows={4} placeholder="Describe the responsibilities and requirements..." value={newJob.description} onChange={e=>setNewJob({...newJob,description:e.target.value})} {...tfProps} />
                  </InputWrapper>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <InputWrapper label="Min Salary (₹)">
                    <TextField type="number" fullWidth placeholder="e.g. 500000" value={newJob.salary_min} onChange={e=>setNewJob({...newJob,salary_min:e.target.value})} {...tfProps} />
                  </InputWrapper>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <InputWrapper label="Max Salary (₹)">
                    <TextField type="number" fullWidth placeholder="e.g. 1000000" value={newJob.salary_max} onChange={e=>setNewJob({...newJob,salary_max:e.target.value})} {...tfProps} />
                  </InputWrapper>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <InputWrapper label="Min Experience (Yrs)">
                    <TextField type="number" fullWidth placeholder="e.g. 1" value={newJob.experience_min} onChange={e=>setNewJob({...newJob,experience_min:e.target.value})} {...tfProps} />
                  </InputWrapper>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <InputWrapper label="Max Experience (Yrs)">
                    <TextField type="number" fullWidth placeholder="e.g. 3" value={newJob.experience_max} onChange={e=>setNewJob({...newJob,experience_max:e.target.value})} {...tfProps} />
                  </InputWrapper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <InputWrapper label="Job Type">
                    <TextField select fullWidth value={newJob.job_type} onChange={e=>setNewJob({...newJob,job_type:e.target.value})} {...tfProps}>
                      {['Full Time', 'Part Time', 'Internship', 'Contract'].map(v=><MenuItem key={v} value={v}>{v}</MenuItem>)}
                    </TextField>
                  </InputWrapper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <InputWrapper label="Work Mode">
                    <TextField select fullWidth value={newJob.work_mode} onChange={e=>setNewJob({...newJob,work_mode:e.target.value})} {...tfProps}>
                      {['Remote', 'Onsite', 'Hybrid'].map(v=><MenuItem key={v} value={v}>{v}</MenuItem>)}
                    </TextField>
                  </InputWrapper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <InputWrapper label="Vacancies">
                    <TextField type="number" fullWidth placeholder="e.g. 2" value={newJob.vacancies} onChange={e=>setNewJob({...newJob,vacancies:e.target.value})} {...tfProps} />
                  </InputWrapper>
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button type="submit" variant="contained" sx={{ bgcolor: '#007bff', textTransform: 'none', fontWeight: 600, px: 4, py: 1.5, borderRadius: '12px', '&:hover': { bgcolor: '#0056b3' } }}>
                  Post Job
                </Button>
              </Box>
            </Box>
          </Paper>
        )}

        {activeTab === 'manage-jobs' && (
          <Paper elevation={0} sx={{ ...cardStyle, overflow: 'hidden', p: 0 }}>
            <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0' }}>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Posted Jobs</Typography>
            </Box>
            <Table>
              <TableHead sx={{ bgcolor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Job Title</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Posted On</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Applicants</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569', textAlign: 'right' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.map(job => (
                  <TableRow key={job.id} sx={{ '&:hover': { bgcolor: '#f1f5f9' } }}>
                    <TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WorkOutlineIcon sx={{ color: '#007bff', fontSize: 20 }} />
                        {job.title}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#475569' }}>{new Date(job.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip label={job.applicant_count} size="small" sx={{ bgcolor: '#eef2f6', color: '#0f172a', fontWeight: 600, borderRadius: '8px' }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={jobStatusChip(job.status).label} size="small" sx={jobStatusChip(job.status).chipSx} />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      {job.status !== 'closed' && (
                        <Button size="small" variant="outlined" onClick={() => handleCloseJob(job.id)} sx={{ color: '#ef4444', borderColor: '#ef4444', textTransform: 'none', fontWeight: 600, borderRadius: '8px', '&:hover': { bgcolor: '#fef2f2' } }}>Close Job</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {jobs.length === 0 && (
                  <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: '#94a3b8' }}>No jobs posted yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        )}

        {activeTab === 'applicants' && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ ...cardStyle, p: 0, height: '600px', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Applicant List</Typography>
                </Box>
                <List sx={{ p: 0, flex: 1, overflowY: 'auto' }}>
                  {applicants.map(app => (
                    <ListItemButton 
                      key={app.id} 
                      onClick={() => setSelectedApplicant(app)}
                      selected={selectedApplicant?.id === app.id}
                      sx={{ 
                        borderBottom: '1px solid #e2e8f0', 
                        p: 2,
                        '&.Mui-selected': { bgcolor: '#eef2f6' },
                        '&:hover': { bgcolor: '#f8fafc' }
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'flex-start' }}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: '#007bff' }}>{app.candidate_name?.[0]}</Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>{app.candidate_name}</Typography>
                          <Typography sx={{ color: '#475569', fontSize: '0.8rem', mt: 0.5 }}>{app.job_title}</Typography>
                          <Box sx={{ mt: 1 }}><Chip label={app.status || 'Applied'} size="small" sx={{ height: 20, fontSize: '0.7rem', ...applicantStatusChip(app.status) }} /></Box>
                        </Box>
                      </Box>
                    </ListItemButton>
                  ))}
                  {applicants.length === 0 && (
                    <Box sx={{ p: 4, textAlign: 'center' }}><Typography sx={{ color: '#94a3b8' }}>No applicants found.</Typography></Box>
                  )}
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
              {selectedApplicant ? (
                <Paper elevation={0} sx={{ ...cardStyle, minHeight: '600px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar sx={{ width: 64, height: 64, bgcolor: '#007bff', fontSize: '1.5rem' }}>{selectedApplicant.candidate_name?.[0]}</Avatar>
                      <Box>
                        <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>{selectedApplicant.candidate_name}</Typography>
                        <Typography sx={{ fontSize: '0.9rem', color: '#475569' }}>{selectedApplicant.candidate_email}</Typography>
                      </Box>
                    </Box>
                    <Button variant="outlined" href={selectedApplicant.resume_url || selectedApplicant.resume} target="_blank" sx={{ color: '#007bff', borderColor: '#007bff', textTransform: 'none', height: 'fit-content', fontWeight: 600, borderRadius: '12px' }}>
                      View Resume
                    </Button>
                  </Box>
                  
                  <Divider sx={{ mb: 4, borderColor: '#e2e8f0' }} />
                  
                  <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', mb: 2 }}>Update Status</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 5 }}>
                    <Button variant={selectedApplicant.status === 'Shortlisted' ? 'contained' : 'outlined'} sx={{ textTransform: 'none', boxShadow: 'none', borderRadius: '12px', bgcolor: selectedApplicant.status === 'Shortlisted' ? '#f97316' : 'transparent', color: selectedApplicant.status === 'Shortlisted' ? '#fff' : '#f97316', borderColor: '#f97316' }} onClick={() => handleUpdateStatus(selectedApplicant.id, 'Shortlisted')}>Shortlist</Button>
                    <Button variant={selectedApplicant.status === 'Interview' ? 'contained' : 'outlined'} sx={{ textTransform: 'none', boxShadow: 'none', borderRadius: '12px', bgcolor: selectedApplicant.status === 'Interview' ? '#8b5cf6' : 'transparent', color: selectedApplicant.status === 'Interview' ? '#fff' : '#8b5cf6', borderColor: '#8b5cf6' }} onClick={() => handleUpdateStatus(selectedApplicant.id, 'Interview')}>Interview</Button>
                    <Button variant={selectedApplicant.status === 'Selected' ? 'contained' : 'outlined'} sx={{ textTransform: 'none', boxShadow: 'none', borderRadius: '12px', color: selectedApplicant.status === 'Selected' ? '#fff' : '#10b981', borderColor: '#10b981', bgcolor: selectedApplicant.status === 'Selected' ? '#10b981' : 'transparent' }} onClick={() => handleUpdateStatus(selectedApplicant.id, 'Selected')}>Select</Button>
                    <Button variant={selectedApplicant.status === 'Rejected' ? 'contained' : 'outlined'} sx={{ textTransform: 'none', boxShadow: 'none', borderRadius: '12px', color: selectedApplicant.status === 'Rejected' ? '#fff' : '#ef4444', borderColor: '#ef4444', bgcolor: selectedApplicant.status === 'Rejected' ? '#ef4444' : 'transparent' }} onClick={() => handleUpdateStatus(selectedApplicant.id, 'Rejected')}>Reject</Button>
                  </Box>
                  
                  <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', mb: 2 }}>Cover Letter</Typography>
                  <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', minHeight: 150 }}>
                    <Typography sx={{ whiteSpace: 'pre-line', color: '#475569', fontSize: '0.9rem' }}>{selectedApplicant.cover_letter || 'No cover letter provided.'}</Typography>
                  </Paper>
                </Paper>
              ) : (
                <Paper elevation={0} sx={{ ...cardStyle, height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ color: '#94a3b8', fontSize: '1.1rem' }}>Select an applicant from the list to view details.</Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        )}

        {activeTab === 'profile' && (
          <Paper elevation={0} sx={cardStyle}>
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>Company Profile</Typography>
            </Box>
            
            {profileMsg.text && (
              <Alert severity={profileMsg.type === 'success' ? 'success' : 'error'} sx={{ mb: 3, borderRadius: '12px' }}>{profileMsg.text}</Alert>
            )}
            
            <Box component="form" onSubmit={handleUpdateProfile} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, p: 3, border: '1px dashed #cbd5e1', borderRadius: '12px', bgcolor: '#f8fafc' }}>
                <Avatar src={profile.logo || profile.avatar_url} sx={{ width: 64, height: 64, bgcolor: '#007bff' }} variant="rounded"><BusinessIcon /></Avatar>
                <Box>
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', mb: 1 }}>Company Logo</Typography>
                  <Button component="label" size="small" variant="contained" sx={{ bgcolor: '#007bff', textTransform: 'none', borderRadius: '8px', boxShadow: 'none', '&:hover': { bgcolor: '#0056b3' } }} disabled={logoUploading}>
                    {logoUploading ? 'Uploading...' : 'Upload Logo'}
                    <input type="file" hidden accept="image/*" onChange={handleLogoUpload} />
                  </Button>
                </Box>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <InputWrapper label="Company Name">
                    <TextField required fullWidth value={profile.company_name} onChange={e=>setProfile({...profile,company_name:e.target.value})} {...tfProps} />
                  </InputWrapper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InputWrapper label="Industry">
                    <TextField fullWidth value={profile.industry || ''} onChange={e=>setProfile({...profile,industry:e.target.value})} {...tfProps} />
                  </InputWrapper>
                </Grid>
                <Grid item xs={12}>
                  <InputWrapper label="Website URL">
                    <TextField fullWidth value={profile.website || ''} onChange={e=>setProfile({...profile,website:e.target.value})} {...tfProps} />
                  </InputWrapper>
                </Grid>
                <Grid item xs={12}>
                  <InputWrapper label="About Company">
                    <TextField fullWidth multiline rows={4} value={profile.description || ''} onChange={e=>setProfile({...profile,description:e.target.value})} {...tfProps} />
                  </InputWrapper>
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button type="submit" variant="contained" sx={{ bgcolor: '#007bff', textTransform: 'none', fontWeight: 600, px: 4, py: 1.5, borderRadius: '12px', '&:hover': { bgcolor: '#0056b3' } }}>
                  Save Profile
                </Button>
              </Box>
            </Box>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
