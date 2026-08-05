import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { safeJson } from '../../utils/api';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';

import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SearchIcon from '@mui/icons-material/Search';

export default function AdminDashboard() {
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  // Stats data
  const [stats, setStats] = useState({
    candidates: 0, employers: 0, admins: 0,
    jobs_approved: 0, jobs_pending: 0, jobs_rejected: 0, jobs_closed: 0,
    applications: 0
  });

  // User management data
  const [users, setUsers] = useState([]);
  const [userMsg, setUserMsg] = useState({ type: '', text: '' });
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Job moderation data
  const [pendingJobs, setPendingJobs] = useState([]);
  const [rejectReasons, setRejectReasons] = useState({}); // jobid -> reason text
  const [jobMsg, setJobMsg] = useState({ type: '', text: '' });

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) setStats(await safeJson(response));
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) setUsers(await safeJson(response));
    } catch (e) { console.error(e); }
  };

  const fetchPendingJobs = async () => {
    try {
      const response = await fetch('/api/admin/jobs/pending', { headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) setPendingJobs(await safeJson(response));
    } catch (e) { console.error(e); }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchUsers(), fetchPendingJobs()]);
    setLoading(false);
  };

  useEffect(() => { if (token) loadAll(); }, [token]);

  // User moderation handler
  const handleModerateUser = async (userId, approval_status, blocked) => {
    setUserMsg({ type: '', text: '' });
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ approval_status, blocked })
      });
      const data = await safeJson(response);
      if (response.ok) {
        setUserMsg({ type: 'success', text: data.message });
        fetchUsers(); fetchStats();
      } else {
        setUserMsg({ type: 'error', text: data.message });
      }
    } catch (e) { setUserMsg({ type: 'error', text: 'Error moderating user.' }); }
  };

  // Job moderation handler (approve/reject)
  const handleModerateJob = async (jobId, action) => {
    setJobMsg({ type: '', text: '' });
    const reason = rejectReasons[jobId] || '';
    if (action === 'reject' && !reason.trim()) {
      setJobMsg({ type: 'error', text: 'Please enter a rejection reason.' });
      return;
    }
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}/moderate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action, reason })
      });
      const data = await safeJson(response);
      if (response.ok) {
        setJobMsg({ type: 'success', text: data.message });
        setRejectReasons(prev => { const updated = { ...prev }; delete updated[jobId]; return updated; });
        fetchPendingJobs(); fetchStats();
      } else {
        setJobMsg({ type: 'error', text: data.message });
      }
    } catch (e) { setJobMsg({ type: 'error', text: 'Error moderating job posting.' }); }
  };

  const getStatusChip = (status) => {
    if (status === 'approved') return { bg: '#10b981', color: '#fff' };
    if (status === 'rejected') return { bg: '#ef4444', color: '#fff' };
    if (status === 'blocked') return { bg: '#0f172a', color: '#fff' };
    return { bg: '#f97316', color: '#fff' }; // pending
  };

  const getRoleChip = (role) => {
    if (role === 'candidate') return { bg: '#0288d1', color: '#fff' };
    if (role === 'employer') return { bg: '#f97316', color: '#fff' };
    return { bg: '#8b5cf6', color: '#fff' }; // admin
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) return (
    <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:3, bgcolor: '#eef2f6' }}>
      <CircularProgress sx={{ color:'#007bff' }} size={44} thickness={4} />
      <Typography sx={{ color:'#475569', fontWeight:600, fontSize:'1rem' }}>Loading Admin Console…</Typography>
    </Box>
  );

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
        }}>
          <Typography sx={{ fontSize: '2rem', fontWeight: 700, mb: 1 }}>Admin Console</Typography>
          <Typography sx={{ fontSize: '1rem', opacity: 0.9 }}>Manage platform users, job approvals, and monitor statistics.</Typography>
        </Box>

        {/* Stats Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'Total Users', value: stats.candidates + stats.employers + stats.admins, icon: <PeopleIcon sx={{ fontSize: 32 }} />, color: '#007bff', bg: '#e0f2fe' },
            { label: 'Pending Approvals', value: stats.jobs_pending, icon: <HourglassEmptyIcon sx={{ fontSize: 32 }} />, color: '#f97316', bg: '#fff7ed' },
            { label: 'Active Jobs', value: stats.jobs_approved, icon: <WorkIcon sx={{ fontSize: 32 }} />, color: '#10b981', bg: '#d1fae5' },
            { label: 'Total Applications', value: stats.applications, icon: <AssignmentIcon sx={{ fontSize: 32 }} />, color: '#8b5cf6', bg: '#f3e8ff' },
          ].map((stat, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper elevation={0} sx={{ ...cardStyle, p: 3, mb: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 2, bgcolor: stat.bg, borderRadius: '12px', color: stat.color }}>{stat.icon}</Box>
                <Box>
                  <Typography sx={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>{stat.value}</Typography>
                  <Typography sx={{ fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>{stat.label}</Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Pill Tabs */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, overflowX: 'auto', pb: 1 }}>
          {[
            { id: 'stats', label: 'Overview' },
            { id: 'users', label: 'User Management' },
            { id: 'jobs', label: `Job Approvals (${pendingJobs.length})` },
            { id: 'applications', label: 'Applications' }
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

        {/* Tab Content */}
        {activeTab === 'stats' && (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={cardStyle}>
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', mb: 3 }}>
                  Job Moderation Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <Typography sx={{ color: '#475569', fontWeight: 600 }}>Approved Live Jobs</Typography>
                    <Chip label={stats.jobs_approved} size="small" sx={{ bgcolor: '#10b981', color: '#fff', fontWeight: 700 }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <Typography sx={{ color: '#475569', fontWeight: 600 }}>Pending Approval Queue</Typography>
                    <Chip label={stats.jobs_pending} size="small" sx={{ bgcolor: '#f97316', color: '#fff', fontWeight: 700 }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <Typography sx={{ color: '#475569', fontWeight: 600 }}>Rejected Postings</Typography>
                    <Chip label={stats.jobs_rejected} size="small" sx={{ bgcolor: '#ef4444', color: '#fff', fontWeight: 700 }} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <Typography sx={{ color: '#475569', fontWeight: 600 }}>Closed Postings</Typography>
                    <Chip label={stats.jobs_closed} size="small" sx={{ bgcolor: '#64748b', color: '#fff', fontWeight: 700 }} />
                  </Box>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={cardStyle}>
                <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', mb: 3 }}>
                  System Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <Typography sx={{ color: '#475569', fontWeight: 600 }}>Active Administrators</Typography>
                    <Typography sx={{ fontWeight: 700, color: '#0f172a' }}>{stats.admins}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <Typography sx={{ color: '#475569', fontWeight: 600 }}>Pending Candidates</Typography>
                    <Typography sx={{ fontWeight: 700, color: '#f97316' }}>{users.filter(u => u.role === 'candidate' && u.approval_status === 'pending').length}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <Typography sx={{ color: '#475569', fontWeight: 600 }}>Pending Employers</Typography>
                    <Typography sx={{ fontWeight: 700, color: '#f97316' }}>{users.filter(u => u.role === 'employer' && u.approval_status === 'pending').length}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <Typography sx={{ color: '#475569', fontWeight: 600 }}>Blocked Accounts</Typography>
                    <Typography sx={{ fontWeight: 700, color: '#ef4444' }}>{users.filter(u => u.blocked || u.approval_status === 'blocked').length}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {activeTab === 'users' && (
          <Paper elevation={0} sx={cardStyle}>
            {userMsg.text && <Alert severity={userMsg.type} sx={{ mb: 3, borderRadius: '12px' }}>{userMsg.text}</Alert>}
            
            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
              <TextField 
                size="medium"
                placeholder="Search users..." 
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#64748b' }} /></InputAdornment>
                }}
                sx={{ 
                  width: { xs: '100%', sm: 350 },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f8fafc',
                    borderRadius: '12px',
                    '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1px' },
                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                    '&.Mui-focused fieldset': { borderColor: '#007bff' }
                  }
                }}
              />
              <TextField
                select
                size="medium"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                sx={{ 
                  width: { xs: '100%', sm: 220 },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#f8fafc',
                    borderRadius: '12px',
                    '& fieldset': { borderColor: '#e2e8f0', borderWidth: '1px' },
                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                    '&.Mui-focused fieldset': { borderColor: '#007bff' }
                  }
                }}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="candidate">Candidate</MenuItem>
                <MenuItem value="employer">Employer</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
            </Box>

            <TableContainer sx={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              <Table>
                <TableHead sx={{ bgcolor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569', textAlign: 'right' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map(u => (
                    <TableRow key={u.id} sx={{ '&:hover': { bgcolor: '#f1f5f9' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: getRoleChip(u.role).bg, width: 40, height: 40 }}>{u.name?.[0]?.toUpperCase()}</Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: '#475569' }}>{u.email}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={u.role} size="small" sx={{ ...getRoleChip(u.role), fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize', borderRadius: '8px' }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={u.blocked ? 'blocked' : u.approval_status} size="small" sx={{ ...getStatusChip(u.blocked ? 'blocked' : u.approval_status), fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize', borderRadius: '8px' }} />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'right' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          {(u.role === 'candidate' || u.role === 'employer') && u.approval_status === 'pending' && !u.blocked && (
                            <>
                              <Button size="small" variant="contained" sx={{ bgcolor: '#10b981', boxShadow: 'none', textTransform: 'none', borderRadius: '8px', '&:hover': {bgcolor: '#059669'} }} onClick={() => handleModerateUser(u.id, 'approved', false)}>Approve</Button>
                              <Button size="small" variant="outlined" sx={{ color: '#ef4444', borderColor: '#ef4444', textTransform: 'none', borderRadius: '8px', '&:hover': {bgcolor: '#fef2f2'} }} onClick={() => handleModerateUser(u.id, 'rejected', false)}>Reject</Button>
                            </>
                          )}
                          {u.role !== 'admin' && (
                            u.blocked 
                              ? <Button size="small" sx={{ color: '#475569', textTransform: 'none' }} onClick={() => handleModerateUser(u.id, 'approved', false)}>Unblock</Button>
                              : <Button size="small" sx={{ color: '#ef4444', textTransform: 'none' }} onClick={() => handleModerateUser(u.id, 'blocked', true)}>Block</Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUsers.length === 0 && (
                    <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', py: 4, color: '#94a3b8' }}>No users found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}

        {activeTab === 'jobs' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {jobMsg.text && <Alert severity={jobMsg.type} sx={{ borderRadius: '12px' }}>{jobMsg.text}</Alert>}
            {pendingJobs.length === 0 ? (
              <Paper elevation={0} sx={{ ...cardStyle, p: 6, textAlign: 'center', bgcolor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
                <Typography sx={{ color: '#10b981', fontSize: '1.2rem', fontWeight: 700, mb: 1 }}>Queue Clear!</Typography>
                <Typography sx={{ color: '#475569' }}>No pending jobs require approval.</Typography>
              </Paper>
            ) : (
              pendingJobs.map(job => (
                <Paper key={job.id} elevation={0} sx={cardStyle}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, pb: 2, borderBottom: '1px solid #e2e8f0' }}>
                    <Box>
                      <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>{job.title}</Typography>
                      <Typography sx={{ color: '#007bff', fontSize: '0.95rem', fontWeight: 600 }}>{job.company_name}</Typography>
                    </Box>
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.85rem' }}>Submitted: {new Date(job.created_at).toLocaleDateString()}</Typography>
                  </Box>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3}><Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>Type</Typography><Typography sx={{ color: '#0f172a' }}>{job.job_type}</Typography></Grid>
                    <Grid item xs={6} sm={3}><Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>Mode</Typography><Typography sx={{ color: '#0f172a' }}>{job.work_mode}</Typography></Grid>
                    <Grid item xs={6} sm={3}><Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>Experience</Typography><Typography sx={{ color: '#0f172a' }}>{job.experience_min} - {job.experience_max} Yrs</Typography></Grid>
                    <Grid item xs={6} sm={3}><Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>Salary</Typography><Typography sx={{ color: '#0f172a' }}>₹{job.salary_min} - ₹{job.salary_max}</Typography></Grid>
                  </Grid>
                  
                  <Typography sx={{ fontWeight: 600, color: '#0f172a', mb: 1, fontSize: '0.95rem' }}>Description</Typography>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', mb: 3 }}>
                    <Typography sx={{ whiteSpace: 'pre-line', color: '#475569', fontSize: '0.9rem' }}>{job.description}</Typography>
                  </Paper>
                  
                  <Box sx={{ mb: 4 }}>
                    <Typography sx={{ fontWeight: 600, color: '#0f172a', mb: 1, fontSize: '0.95rem' }}>Skills Required</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {Array.isArray(job.skills) && job.skills.map((s, i) => (
                        <Chip key={i} label={s} size="small" sx={{ bgcolor: '#eef2f6', color: '#0f172a', borderRadius: '8px', fontWeight: 500 }} />
                      ))}
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: 2, pt: 3, borderTop: '1px solid #e2e8f0', alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField 
                      size="small" 
                      placeholder="Rejection Reason" 
                      variant="outlined" 
                      value={rejectReasons[job.id] || ''} 
                      onChange={e => setRejectReasons({...rejectReasons, [job.id]: e.target.value})} 
                      sx={{
                        flex: 1,
                        minWidth: '200px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          bgcolor: '#f8fafc',
                        }
                      }}
                    />
                    <Button variant="outlined" sx={{ color: '#ef4444', borderColor: '#ef4444', textTransform: 'none', whiteSpace: 'nowrap', borderRadius: '12px', px: 3 }} onClick={() => handleModerateJob(job.id, 'reject')}>Reject</Button>
                    <Button variant="contained" sx={{ bgcolor: '#10b981', boxShadow: 'none', textTransform: 'none', whiteSpace: 'nowrap', borderRadius: '12px', px: 3, '&:hover': {bgcolor: '#059669'} }} onClick={() => handleModerateJob(job.id, 'approve')}>Approve Job</Button>
                  </Box>
                </Paper>
              ))
            )}
          </Box>
        )}

        {activeTab === 'applications' && (
          <Paper elevation={0} sx={{ ...cardStyle, p: 6, textAlign: 'center', bgcolor: '#f8fafc', border: '1px dashed #cbd5e1' }}>
            <Typography sx={{ color: '#007bff', fontSize: '1.2rem', fontWeight: 700, mb: 1 }}>Applications View</Typography>
            <Typography sx={{ color: '#475569' }}>This section is currently under construction. Applications will appear here.</Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
