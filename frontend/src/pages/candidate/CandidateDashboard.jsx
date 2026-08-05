import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
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
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';

import EditIcon from '@mui/icons-material/Edit';
import WorkOutlineIcon from '@mui/icons-material/WorkOutlined';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import DeleteIcon from '@mui/icons-material/Delete';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';

const statusChip = (status) => {
  const m = {
    Selected:   { bg:'#10b981', color:'#ffffff' }, // Green
    Interview:  { bg:'#8b5cf6', color:'#ffffff' }, // Purple
    Shortlisted:{ bg:'#f97316', color:'#ffffff' }, // Orange
    Rejected:   { bg:'#ef4444', color:'#ffffff' }, // Red
    Applied:    { bg:'#0288d1', color:'#ffffff' }, // Sky blue
  };
  const s = m[status] || m.Applied;
  return { bgcolor: s.bg, color: s.color, fontWeight: 600, fontSize: '0.75rem', borderRadius: '4px' };
};

export default function CandidateDashboard() {
  const { token, refreshProfile } = useAuth();

  const [profile,      setProfile]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('profile');
  const [applications, setApplications] = useState([]);
  const [editingAbout, setEditingAbout] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const [fullName,        setFullName]        = useState('');
  const [headline,        setHeadline]        = useState('');
  const [aboutMe,         setAboutMe]         = useState('');
  const [expectedSalary,  setExpectedSalary]  = useState('');
  const [noticePeriod,    setNoticePeriod]    = useState('Immediate');

  const [newSkill, setNewSkill] = useState({ name:'', level:'Beginner' });
  const [newEdu,   setNewEdu]   = useState({ degree:'', institution:'', year:'', percentage:'' });
  const [newExp,   setNewExp]   = useState({ company:'', designation:'', technologies:'', start_date:'', end_date:'', current:false });
  const [newCert,  setNewCert]  = useState({ name:'', issue_date:'', url:'' });
  
  const [formOpen, setFormOpen] = useState({ skill: false, edu: false, exp: false, cert: false });

  const fetchProfile = async () => {
    try {
      const r = await fetch('/api/profiles/candidate', { headers:{ Authorization:`Bearer ${token}` } });
      if (r.ok) {
        const d = await safeJson(r);
        setProfile(d);
        setFullName(d.full_name||''); setHeadline(d.headline||''); setAboutMe(d.about_me||'');
        setExpectedSalary(d.expected_salary||''); setNoticePeriod(d.notice_period||'Immediate');
      }
    } catch(e){ console.error(e); } finally { setLoading(false); }
  };

  const fetchApplications = async () => {
    try {
      const r = await fetch('/api/applications/candidate', { headers:{ Authorization:`Bearer ${token}` } });
      if (r.ok) setApplications(await safeJson(r));
    } catch(e){ console.error(e); }
  };

  useEffect(() => { if (token) { fetchProfile(); fetchApplications(); } }, [token]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const r = await fetch('/api/profiles/candidate', {
      method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
      body: JSON.stringify({ full_name:fullName, headline, about_me:aboutMe, expected_salary:expectedSalary, notice_period:noticePeriod })
    });
    if (r.ok) { setEditingAbout(false); fetchProfile(); refreshProfile(); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const r = await fetch('/api/profiles/upload-image', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (r.ok) { await fetchProfile(); await refreshProfile(); }
    } catch(err) { console.error('Avatar upload error', err); }
    finally { setAvatarUploading(false); }
  };

  const apiPost = async (url, body) => {
    const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify(body) });
    if (r.ok) fetchProfile();
  };
  const apiDel = async (url) => {
    await fetch(url, { method:'DELETE', headers:{ Authorization:`Bearer ${token}` } });
    fetchProfile();
  };

  const handleAddSkill = (e) => { e.preventDefault(); if (!newSkill.name) return; apiPost('/api/profiles/candidate/skills', { skill_name:newSkill.name, level:newSkill.level }); setNewSkill({ name:'', level:'Beginner' }); setFormOpen(p => ({...p, skill: false})); };
  const handleAddEdu   = (e) => { e.preventDefault(); if (!newEdu.degree||!newEdu.institution||!newEdu.year) return; apiPost('/api/profiles/candidate/education', newEdu); setNewEdu({ degree:'', institution:'', year:'', percentage:'' }); setFormOpen(p => ({...p, edu: false})); };
  const handleAddExp   = (e) => { e.preventDefault(); if (!newExp.company||!newExp.designation||!newExp.start_date) return; apiPost('/api/profiles/candidate/experience', { ...newExp, end_date:newExp.current?null:newExp.end_date }); setNewExp({ company:'', designation:'', technologies:'', start_date:'', end_date:'', current:false }); setFormOpen(p => ({...p, exp: false})); };
  const handleAddCert  = (e) => { e.preventDefault(); if (!newCert.name) return; apiPost('/api/profiles/candidate/certifications', newCert); setNewCert({ name:'', issue_date:'', url:'' }); setFormOpen(p => ({...p, cert: false})); };

  if (loading) return (
    <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:3, bgcolor: '#eef2f6' }}>
      <CircularProgress sx={{ color:'#007bff' }} size={44} thickness={4} />
      <Typography sx={{ color:'#475569', fontWeight:600, fontSize:'1rem' }}>Loading your profile…</Typography>
    </Box>
  );

  const calculateCompleteness = () => {
    let score = 0;
    if (profile?.full_name) score += 20;
    if (profile?.headline) score += 10;
    if (profile?.about_me) score += 20;
    if (profile?.skills?.length > 0) score += 20;
    if (profile?.education?.length > 0) score += 15;
    if (profile?.experience?.length > 0) score += 15;
    return Math.min(score, 100);
  };

  const tfProps = { 
    size: "small", 
    variant: "outlined", 
    sx: { 
      '& .MuiOutlinedInput-root': { borderRadius: '12px' },
      bgcolor: '#fff'
    } 
  };
  
  const SectionHeader = ({ title, icon }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
      <Box sx={{ width: 4, height: 24, bgcolor: '#007bff', borderRadius: 1 }} />
      {icon && <Box sx={{ color: '#007bff', display: 'flex' }}>{icon}</Box>}
      <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>{title}</Typography>
    </Box>
  );

  const cardStyle = {
    borderRadius: '16px',
    p: 3,
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
    bgcolor: '#ffffff',
    mb: 3
  };

  return (
    <Box sx={{ bgcolor: '#eef2f6', minHeight: '100vh', fontFamily: "'Inter', sans-serif", pb: 6 }}>
      
      <Container maxWidth="md" sx={{ pt: 4 }}>
        {/* Hero Banner */}
        <Box sx={{ 
          bgcolor: '#007bff', 
          color: '#fff', 
          borderRadius: '24px', 
          p: { xs: 3, md: 5 }, 
          mb: 4,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: 1.5, opacity: 0.9, mb: 1, textTransform: 'uppercase' }}>
            Student Area
          </Typography>
          <Typography sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 800, mb: 2 }}>
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}!
          </Typography>
          <Typography sx={{ fontSize: '1rem', opacity: 0.9, mb: 3 }}>
            {profile?.headline || 'Update your profile to stand out to recruiters.'}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ position: 'relative' }}>
                  <label htmlFor="hero-avatar-upload" style={{ cursor:'pointer' }}>
                    <Avatar src={profile?.avatar_url || undefined} sx={{ width: 72, height: 72, border: '3px solid rgba(255,255,255,0.4)', fontSize: '2rem', bgcolor: '#0056b3', color: '#fff' }}>
                      {!profile?.avatar_url && (profile?.full_name?.[0]?.toUpperCase() || <PersonIcon fontSize="large" />)}
                    </Avatar>
                    <Box sx={{ position: 'absolute', bottom: 0, right: 0, bgcolor: '#f97316', borderRadius: '50%', p: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {avatarUploading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <CameraAltIcon sx={{ fontSize: 14, color: '#fff' }} />}
                    </Box>
                  </label>
                  <input id="hero-avatar-upload" type="file" accept="image/*" style={{ display:'none' }} onChange={handleAvatarUpload} />
                </Box>
             </Box>
             <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', p: 2, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: 2, backdropFilter: 'blur(10px)' }}>
                <Box>
                  <Typography sx={{ fontSize: '0.8rem', color: '#e0f2fe', fontWeight: 500 }}>Profile Completeness</Typography>
                  <Typography sx={{ fontSize: '1.2rem', color: '#fff', fontWeight: 700 }}>{calculateCompleteness()}%</Typography>
                </Box>
                <CircularProgress variant="determinate" value={calculateCompleteness()} size={40} sx={{ color: '#fff' }} />
             </Box>
          </Box>
        </Box>

        {/* Tab Selector */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center' }}>
          {['profile', 'applications'].map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              sx={{
                py: 1.5,
                px: 4,
                borderRadius: '50px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                bgcolor: activeTab === tab ? '#0f172a' : '#ffffff',
                color: activeTab === tab ? '#ffffff' : '#475569',
                boxShadow: activeTab === tab ? '0 4px 12px rgba(15,23,42,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                '&:hover': { bgcolor: activeTab === tab ? '#1e293b' : '#f8fafc' }
              }}
            >
              {tab === 'profile' ? 'Profile Details' : 'My Applications'}
            </Button>
          ))}
        </Box>

        {activeTab === 'profile' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            
            {/* General Details */}
            <Paper elevation={0} sx={cardStyle}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <SectionHeader title="General Details" icon={<PersonIcon />} />
                <IconButton size="small" onClick={() => setEditingAbout(!editingAbout)} sx={{ color: '#007bff', bgcolor: '#f0f9ff', '&:hover': { bgcolor: '#e0f2fe' } }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Box>
              <Collapse in={editingAbout}>
                <Box component="form" onSubmit={handleUpdateProfile} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3, mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 1, color: '#334155' }}>Full Name</Typography>
                      <TextField required fullWidth value={fullName} onChange={e=>setFullName(e.target.value)} {...tfProps} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 1, color: '#334155' }}>Headline</Typography>
                      <TextField fullWidth value={headline} onChange={e=>setHeadline(e.target.value)} placeholder="e.g. Senior Frontend Developer" {...tfProps} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 1, color: '#334155' }}>About Me</Typography>
                      <TextField fullWidth multiline rows={4} value={aboutMe} onChange={e=>setAboutMe(e.target.value)} placeholder="Write a short summary about your background..." {...tfProps} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 1, color: '#334155' }}>Expected Salary (₹ Annual)</Typography>
                      <TextField type="number" fullWidth value={expectedSalary} onChange={e=>setExpectedSalary(e.target.value)} {...tfProps} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 1, color: '#334155' }}>Notice Period</Typography>
                      <TextField select fullWidth value={noticePeriod} onChange={e=>setNoticePeriod(e.target.value)} {...tfProps}>
                        {['Immediate','15 Days','30 Days','60 Days','90 Days'].map(v=><MenuItem key={v} value={v}>{v}</MenuItem>)}
                      </TextField>
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button onClick={() => setEditingAbout(false)} sx={{ color: '#475569', textTransform: 'none', fontWeight: 600, borderRadius: '12px' }}>Cancel</Button>
                    <Button type="submit" variant="contained" sx={{ bgcolor: '#007bff', borderRadius: '12px', textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#0056b3' } }}>Save Details</Button>
                  </Box>
                </Box>
              </Collapse>
              {!editingAbout && (
                <Box>
                  <Typography sx={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6, mb: 3 }}>{profile?.about_me || 'No summary added. Please add to let recruiters find you.'}</Typography>
                  <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', p: 2, bgcolor: '#f8fafc', borderRadius: '12px' }}>
                    <Box>
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.8rem', mb: 0.5, fontWeight: 500 }}>Expected Salary</Typography>
                      <Typography sx={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 600 }}>{profile?.expected_salary ? `₹${profile.expected_salary}` : 'Not provided'}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ color: '#94a3b8', fontSize: '0.8rem', mb: 0.5, fontWeight: 500 }}>Notice Period</Typography>
                      <Typography sx={{ color: '#0f172a', fontSize: '0.95rem', fontWeight: 600 }}>{profile?.notice_period || 'Immediate'}</Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Paper>

            {/* Experience */}
            <Paper elevation={0} sx={cardStyle}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <SectionHeader title="Work Experience" icon={<WorkOutlineIcon />} />
                <Button size="small" variant="contained" sx={{ bgcolor: '#007bff', color: '#fff', borderRadius: '12px', textTransform: 'none', fontWeight: 600, boxShadow:'none', '&:hover': { bgcolor: '#0056b3' } }} onClick={() => setFormOpen(p => ({...p, exp: !p.exp}))}>+ Add</Button>
              </Box>
              <Collapse in={formOpen.exp}>
                <Box component="form" onSubmit={handleAddExp} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3, bgcolor: '#f8fafc', p: 3, borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 1, color: '#334155' }}>Company</Typography>
                      <TextField required fullWidth value={newExp.company} onChange={e=>setNewExp({...newExp,company:e.target.value})} {...tfProps} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 1, color: '#334155' }}>Designation</Typography>
                      <TextField required fullWidth value={newExp.designation} onChange={e=>setNewExp({...newExp,designation:e.target.value})} {...tfProps} />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 1, color: '#334155' }}>Technologies Used</Typography>
                      <TextField fullWidth value={newExp.technologies} onChange={e=>setNewExp({...newExp,technologies:e.target.value})} {...tfProps} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 1, color: '#334155' }}>Start Date</Typography>
                      <TextField type="date" required fullWidth value={newExp.start_date} onChange={e=>setNewExp({...newExp,start_date:e.target.value})} {...tfProps} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 1, color: '#334155' }}>End Date</Typography>
                      <TextField type="date" fullWidth disabled={newExp.current} value={newExp.end_date} onChange={e=>setNewExp({...newExp,end_date:e.target.value})} {...tfProps} />
                      <Box sx={{ display:'flex', alignItems:'center', gap:1, mt: 1 }}>
                        <input type="checkbox" checked={newExp.current} onChange={e=>setNewExp({...newExp,current:e.target.checked})} id="curr-job" />
                        <label htmlFor="curr-job" style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>Currently working here</label>
                      </Box>
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button onClick={() => setFormOpen(p => ({...p, exp: false}))} sx={{ color: '#475569', textTransform: 'none', fontWeight: 600, borderRadius: '12px' }}>Cancel</Button>
                    <Button type="submit" variant="contained" sx={{ bgcolor: '#007bff', borderRadius: '12px', textTransform: 'none', boxShadow: 'none', fontWeight: 600, '&:hover': { bgcolor: '#0056b3' } }}>Save Experience</Button>
                  </Box>
                </Box>
              </Collapse>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {profile?.experience?.map(exp => (
                  <Box key={exp.id} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>{exp.designation}</Typography>
                      <Typography sx={{ color: '#007bff', fontSize: '0.9rem', mb: 0.5, fontWeight: 600 }}>{exp.company}</Typography>
                      <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                        {new Date(exp.start_date).toLocaleDateString()} - {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Present'}
                      </Typography>
                    </Box>
                    <IconButton size="small" onClick={()=>apiDel(`/api/profiles/candidate/experience/${exp.id}`)} sx={{ color: '#ef4444', bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2' } }}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                ))}
                {(!profile?.experience || profile.experience.length === 0) && <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', py: 2 }}>No experience added yet.</Typography>}
              </Box>
            </Paper>

            {/* Education */}
            <Paper elevation={0} sx={cardStyle}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <SectionHeader title="Education" icon={<SchoolIcon />} />
                <Button size="small" variant="contained" sx={{ bgcolor: '#007bff', color: '#fff', borderRadius: '12px', textTransform: 'none', fontWeight: 600, boxShadow:'none', '&:hover': { bgcolor: '#0056b3' } }} onClick={() => setFormOpen(p => ({...p, edu: !p.edu}))}>+ Add</Button>
              </Box>
              <Collapse in={formOpen.edu}>
                <Box component="form" onSubmit={handleAddEdu} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3, bgcolor: '#f8fafc', p: 3, borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 1, color: '#334155' }}>Degree</Typography>
                      <TextField required fullWidth value={newEdu.degree} onChange={e=>setNewEdu({...newEdu,degree:e.target.value})} {...tfProps} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 1, color: '#334155' }}>Institution</Typography>
                      <TextField required fullWidth value={newEdu.institution} onChange={e=>setNewEdu({...newEdu,institution:e.target.value})} {...tfProps} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 1, color: '#334155' }}>Graduation Year</Typography>
                      <TextField type="number" required fullWidth value={newEdu.year} onChange={e=>setNewEdu({...newEdu,year:e.target.value})} {...tfProps} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, mb: 1, color: '#334155' }}>Percentage/GPA</Typography>
                      <TextField fullWidth value={newEdu.percentage} onChange={e=>setNewEdu({...newEdu,percentage:e.target.value})} {...tfProps} />
                    </Grid>
                  </Grid>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button onClick={() => setFormOpen(p => ({...p, edu: false}))} sx={{ color: '#475569', textTransform: 'none', fontWeight: 600, borderRadius: '12px' }}>Cancel</Button>
                    <Button type="submit" variant="contained" sx={{ bgcolor: '#007bff', borderRadius: '12px', textTransform: 'none', boxShadow: 'none', fontWeight: 600, '&:hover': { bgcolor: '#0056b3' } }}>Save Education</Button>
                  </Box>
                </Box>
              </Collapse>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {profile?.education?.map(edu => (
                  <Box key={edu.id} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>{edu.degree}</Typography>
                      <Typography sx={{ color: '#007bff', fontSize: '0.9rem', mb: 0.5, fontWeight: 600 }}>{edu.institution}</Typography>
                      <Typography sx={{ color: '#64748b', fontSize: '0.85rem' }}>{edu.year} | {edu.percentage}</Typography>
                    </Box>
                    <IconButton size="small" onClick={()=>apiDel(`/api/profiles/candidate/education/${edu.id}`)} sx={{ color: '#ef4444', bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2' } }}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                ))}
                {(!profile?.education || profile.education.length === 0) && <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', py: 2 }}>No education added yet.</Typography>}
              </Box>
            </Paper>

            {/* IT Skills */}
            <Paper elevation={0} sx={cardStyle}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <SectionHeader title="IT Skills" icon={<StarIcon />} />
                <IconButton size="small" sx={{ color: '#007bff', bgcolor: '#f0f9ff', '&:hover': { bgcolor: '#e0f2fe' } }} onClick={() => setFormOpen(p => ({...p, skill: !p.skill}))}><EditIcon fontSize="small" /></IconButton>
              </Box>
              <Collapse in={formOpen.skill}>
                <Box component="form" onSubmit={handleAddSkill} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3, bgcolor: '#f8fafc', p: 3, borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Skill Name</Typography>
                  <TextField required value={newSkill.name} onChange={e=>setNewSkill({...newSkill,name:e.target.value})} {...tfProps} />
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', mt: 1 }}>Level</Typography>
                  <TextField select value={newSkill.level} onChange={e=>setNewSkill({...newSkill,level:e.target.value})} {...tfProps}>
                    {['Beginner','Intermediate','Expert'].map(v=><MenuItem key={v} value={v}>{v}</MenuItem>)}
                  </TextField>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button onClick={() => setFormOpen(p => ({...p, skill: false}))} sx={{ color: '#475569', textTransform: 'none', fontWeight: 600, borderRadius: '12px' }}>Cancel</Button>
                    <Button type="submit" variant="contained" sx={{ bgcolor: '#007bff', borderRadius: '12px', textTransform: 'none', boxShadow: 'none', fontWeight: 600, '&:hover': { bgcolor: '#0056b3' } }}>Add Skill</Button>
                  </Box>
                </Box>
              </Collapse>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {profile?.skills?.map(sk => (
                  <Chip key={sk.id} label={`${sk.skill_name} (${sk.level})`} size="medium" onDelete={() => apiDel(`/api/profiles/candidate/skills/${sk.id}`)}
                    deleteIcon={<DeleteIcon sx={{ fill: '#007bff' }} />}
                    sx={{ bgcolor: '#eef2f6', color: '#0f172a', border: '1px solid #e2e8f0', borderRadius: '12px', fontWeight: 500, py: 2 }}
                  />
                ))}
                {(!profile?.skills || profile.skills.length === 0) && <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', py: 2, width: '100%' }}>No skills added yet.</Typography>}
              </Box>
            </Paper>

            {/* Certifications */}
            <Paper elevation={0} sx={cardStyle}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <SectionHeader title="Certifications" icon={<EmojiEventsIcon />} />
                <IconButton size="small" sx={{ color: '#007bff', bgcolor: '#f0f9ff', '&:hover': { bgcolor: '#e0f2fe' } }} onClick={() => setFormOpen(p => ({...p, cert: !p.cert}))}><EditIcon fontSize="small" /></IconButton>
              </Box>
              <Collapse in={formOpen.cert}>
                <Box component="form" onSubmit={handleAddCert} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3, bgcolor: '#f8fafc', p: 3, borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Certificate Name</Typography>
                  <TextField required fullWidth value={newCert.name} onChange={e=>setNewCert({...newCert,name:e.target.value})} {...tfProps} />
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', mt: 1 }}>Issue Date</Typography>
                  <TextField type="date" fullWidth value={newCert.issue_date} onChange={e=>setNewCert({...newCert,issue_date:e.target.value})} {...tfProps} />
                  <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', mt: 1 }}>Verify URL</Typography>
                  <TextField fullWidth value={newCert.url} onChange={e=>setNewCert({...newCert,url:e.target.value})} {...tfProps} />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <Button onClick={() => setFormOpen(p => ({...p, cert: false}))} sx={{ color: '#475569', textTransform: 'none', fontWeight: 600, borderRadius: '12px' }}>Cancel</Button>
                    <Button type="submit" variant="contained" sx={{ bgcolor: '#007bff', borderRadius: '12px', textTransform: 'none', boxShadow: 'none', fontWeight: 600, '&:hover': { bgcolor: '#0056b3' } }}>Save</Button>
                  </Box>
                </Box>
              </Collapse>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {profile?.certifications?.map(cert => (
                  <Box key={cert.id} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>{cert.name}</Typography>
                      <Typography sx={{ color: '#64748b', fontSize: '0.85rem', mt: 0.5 }}>Issued: {new Date(cert.issue_date).toLocaleDateString()}</Typography>
                    </Box>
                    <IconButton size="small" onClick={()=>apiDel(`/api/profiles/candidate/certifications/${cert.id}`)} sx={{ color: '#ef4444', bgcolor: '#fef2f2', '&:hover': { bgcolor: '#fee2e2' } }}><DeleteIcon fontSize="small" /></IconButton>
                  </Box>
                ))}
                {(!profile?.certifications || profile.certifications.length === 0) && <Typography sx={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', py: 2 }}>No certifications added yet.</Typography>}
              </Box>
            </Paper>

          </Box>
        )}

        {activeTab === 'applications' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>Applications</Typography>
              <Button component={Link} to="/jobs" variant="contained" sx={{ bgcolor: '#007bff', color: '#fff', borderRadius: '12px', textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#0056b3' } }}>
                Search Jobs
              </Button>
            </Box>
            
            {applications.length === 0 ? (
              <Paper elevation={0} sx={{ ...cardStyle, textAlign: 'center', py: 8 }}>
                <Typography sx={{ color: '#475569', fontSize: '1.1rem', fontWeight: 500 }}>You haven't applied to any jobs yet.</Typography>
                <Button component={Link} to="/jobs" sx={{ mt: 2, color: '#007bff', fontWeight: 600, textTransform: 'none' }}>Browse available jobs &rarr;</Button>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {applications.map(app => (
                  <Paper elevation={0} key={app.id} sx={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 2, mb: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                         <Avatar sx={{ bgcolor: '#e0f2fe', color: '#007bff', borderRadius: '12px', width: 48, height: 48 }} variant="rounded"><BusinessCenterIcon /></Avatar>
                         <Box>
                           <Typography component="a" href={`/jobs/${app.job_id}`} sx={{ color: '#0f172a', textDecoration: 'none', fontWeight: 700, fontSize: '1.15rem', '&:hover': { color: '#007bff' } }}>
                             {app.job_title}
                           </Typography>
                           <Typography sx={{ color: '#007bff', fontWeight: 600, fontSize: '0.95rem' }}>{app.company_name}</Typography>
                         </Box>
                      </Box>
                      <Chip label={app.status || 'Applied'} size="medium" sx={{ ...statusChip(app.status), borderRadius: '8px', px: 1, py: 0.5, height: 'auto' }} />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', pt: 2, mt: 1 }}>
                      <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>Applied on {new Date(app.created_at).toLocaleDateString()}</Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
