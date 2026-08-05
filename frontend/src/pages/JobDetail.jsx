import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { safeJson } from '../utils/api';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Chip,
  Avatar,
  Divider,
  Modal,
  TextField,
  CircularProgress,
  Alert,
  IconButton
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import BusinessIcon from '@mui/icons-material/Business';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import GroupIcon from '@mui/icons-material/Group';
import WorkOutlineIcon from '@mui/icons-material/WorkOutlined';
import PeopleIcon from '@mui/icons-material/People';

export default function JobDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasApplied, setHasApplied] = useState(false);

  const fetchJobDetails = async () => {
    try {
      const response = await fetch(`/api/jobs/${id}`);
      if (response.ok) {
        const data = await safeJson(response);
        setJob(data);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkApplicationStatus = async () => {
    if (!user || user.role !== 'candidate' || !token) return;

    try {
      const response = await fetch('/api/applications/candidate', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const applications = await safeJson(response);
        const applied = applications.some(app => app.job_id === parseInt(id));
        setHasApplied(applied);
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  useEffect(() => {
    checkApplicationStatus();
  }, [id, user, token]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      setMessage({ type: 'error', text: 'Please upload your resume file.' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const formData = new FormData();
      formData.append('job_id', id);
      formData.append('cover_letter', coverLetter);
      formData.append('resume', resumeFile);

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit application.');
      }

      setMessage({ type: 'success', text: data.message });
      setHasApplied(true);
      setTimeout(() => {
        setShowApplyModal(false);
        setCoverLetter('');
        setResumeFile(null);
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: '#0288d1', mb: 2 }} />
        <Typography sx={{ color: '#475569', fontWeight: 500 }}>Loading job details...</Typography>
      </Box>
    );
  }

  if (!job) {
    return (
      <Container maxWidth="md" sx={{ textAlign: 'center', py: 10 }}>
        <ErrorOutlineIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
        <Typography variant="h5" sx={{ color: '#0f172a', fontWeight: 700, mb: 2 }}>Job Not Found</Typography>
        <Typography sx={{ color: '#475569', mb: 4 }}>The job listing you are looking for does not exist or has been removed.</Typography>
        <Button component={Link} to="/jobs" variant="outlined" sx={{ color: '#0288d1', borderColor: '#0288d1', textTransform: 'none' }}>
          Back to Listings
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f0f9ff', minHeight: '100vh', py: 4, fontFamily: "'Inter', sans-serif" }}>
      <Container maxWidth="xl">
        {/* Back Link */}
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            to="/jobs"
            startIcon={<ChevronLeftIcon />}
            sx={{ color: '#475569', textTransform: 'none', fontWeight: 600 }}
          >
            Back to Listings
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Left Main Content */}
          <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
            <Paper elevation={0} sx={{ p: '32px', borderRadius: '12px', border: '1px solid #e0f2fe', mb: 3, bgcolor: '#ffffff' }}>
              {/* Header Info */}
              <Box sx={{ display: 'flex', gap: 3, mb: 4, alignItems: 'center' }}>
                <Avatar
                  src={job.company_logo}
                  alt={job.company_name}
                  sx={{ width: 80, height: 80, borderRadius: '12px', bgcolor: '#e0f7fa', color: '#0288d1', fontSize: '32px', fontWeight: 700 }}
                >
                  {job.company_name?.charAt(0) || <BusinessIcon fontSize="large" />}
                </Avatar>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5, fontSize: { xs: '24px', sm: '32px' } }}>
                    {job.title}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                    <Typography sx={{ color: '#0f172a', fontWeight: 600, fontSize: '16px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <BusinessCenterIcon fontSize="small" sx={{ color: '#0288d1' }} /> {job.company_name}
                    </Typography>
                    <Typography sx={{ color: '#475569', fontSize: '16px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationOnIcon fontSize="small" sx={{ color: '#0288d1' }} /> {job.work_mode}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ mb: 4, borderColor: '#e0f2fe' }} />

              {/* Job Description */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ width: '4px', height: '24px', bgcolor: '#0288d1', mr: 1.5, borderRadius: '2px' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '20px' }}>
                    Job Description
                  </Typography>
                </Box>
                <Typography sx={{ color: '#475569', fontSize: '16px', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {job.description}
                </Typography>
              </Box>

              <Divider sx={{ mb: 4, borderColor: '#e0f2fe' }} />

              {/* Required Skills */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ width: '4px', height: '24px', bgcolor: '#0288d1', mr: 1.5, borderRadius: '2px' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '20px' }}>
                    Required Skills
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                  {Array.isArray(job.skills) && job.skills.map((skill, idx) => (
                    <Chip
                      key={idx}
                      label={skill}
                      sx={{
                        bgcolor: '#e0f7fa',
                        color: '#01579b',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '14px',
                        border: 'none',
                        px: 1
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Divider sx={{ mb: 4, borderColor: '#e0f2fe' }} />

              {/* About Company */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ width: '4px', height: '24px', bgcolor: '#0288d1', mr: 1.5, borderRadius: '2px' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '20px' }}>
                    About Company
                  </Typography>
                </Box>
                {job.company_description ? (
                  <Typography sx={{ color: '#475569', fontSize: '16px', lineHeight: 1.7 }}>
                    {job.company_description}
                  </Typography>
                ) : (
                  <Typography sx={{ color: '#94a3b8', fontStyle: 'italic' }}>
                    No description provided by the company.
                  </Typography>
                )}
              </Box>
            </Paper>
          </Box>

          {/* Right Sticky Column */}
          <Box sx={{ width: { xs: '100%', md: '320px' }, flexShrink: 0, position: { md: 'sticky' }, top: 80, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper elevation={0} sx={{ p: '24px', borderRadius: '12px', border: '1px solid #e0f2fe', borderTop: '4px solid #0288d1', bgcolor: '#ffffff' }}>
              <Box sx={{ mb: 3 }}>
                <Typography sx={{ color: '#10b981', fontSize: '28px', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                  <CurrencyRupeeIcon sx={{ fontSize: 28 }} /> {parseFloat(job.salary_min).toLocaleString('en-IN')} - {parseFloat(job.salary_max).toLocaleString('en-IN')}
                </Typography>
                <Typography sx={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500, mt: 0.5 }}>
                  per year
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                <Chip icon={<WorkOutlineIcon style={{ color: '#01579b' }} />} label={job.job_type} sx={{ bgcolor: '#e0f7fa', color: '#01579b', fontWeight: 600, borderRadius: '8px', border: 'none' }} />
                <Chip icon={<LocationOnIcon style={{ color: '#01579b' }} />} label={job.work_mode} sx={{ bgcolor: '#e0f7fa', color: '#01579b', fontWeight: 600, borderRadius: '8px', border: 'none' }} />
              </Box>

              <Divider sx={{ mb: 3, borderColor: '#e0f2fe' }} />

              {!user ? (
                <Button
                  component={Link}
                  to="/login"
                  fullWidth
                  variant="contained"
                  sx={{ background: 'linear-gradient(135deg, #f97316, #fb923c)', color: '#fff', height: '48px', fontWeight: 700, borderRadius: '8px', textTransform: 'none', fontSize: '16px', boxShadow: 'none' }}
                >
                  Log in to Apply
                </Button>
              ) : user.role === 'candidate' ? (
                user.approval_status !== 'approved' ? (
                  <Alert severity="warning" sx={{ textAlign: 'left', mb: 2, fontSize: '13px', borderRadius: '8px' }}>
                    Profile is {user.approval_status}. Admin approval required to apply.
                  </Alert>
                ) : hasApplied ? (
                  <Button
                    fullWidth
                    disabled
                    sx={{ height: '48px', fontWeight: 700, borderRadius: '8px', textTransform: 'none', bgcolor: '#e0f7fa', color: '#01579b', fontSize: '16px' }}
                  >
                    Already Applied
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowApplyModal(true)}
                    fullWidth
                    variant="contained"
                    sx={{ background: 'linear-gradient(135deg, #f97316, #fb923c)', color: '#fff', height: '48px', fontWeight: 700, borderRadius: '8px', textTransform: 'none', fontSize: '16px', boxShadow: 'none' }}
                  >
                    Apply Now
                  </Button>
                )
              ) : (
                <Button
                  fullWidth
                  disabled
                  sx={{ height: '48px', fontWeight: 700, borderRadius: '8px', textTransform: 'none', fontSize: '16px' }}
                >
                  Available for Candidates
                </Button>
              )}

              <Button
                fullWidth
                variant="outlined"
                startIcon={<BookmarkBorderIcon />}
                sx={{ mt: 2, color: '#0288d1', borderColor: '#0288d1', height: '48px', fontWeight: 600, borderRadius: '8px', textTransform: 'none', fontSize: '16px', '&:hover': { borderColor: '#01579b', bgcolor: '#f0f9ff' } }}
              >
                Save Job
              </Button>

              <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                  <Typography sx={{ color: '#475569', fontSize: '14px', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon fontSize="small" sx={{ color: '#94a3b8' }} /> Posted
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
                    {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                  <Typography sx={{ color: '#475569', fontSize: '14px', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <GroupIcon fontSize="small" sx={{ color: '#94a3b8' }} /> Vacancies
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
                    {job.vacancies}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 3, borderColor: '#e0f2fe' }} />

              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    src={job.company_logo}
                    sx={{ width: 48, height: 48, borderRadius: '8px', bgcolor: '#f0f9ff', color: '#0288d1', fontWeight: 'bold' }}
                  >
                    {job.company_name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#0f172a', fontSize: '16px' }}>
                      {job.company_name}
                    </Typography>
                    <Typography sx={{ color: '#0288d1', fontSize: '13px', fontWeight: 600 }}>
                      View Company Profile
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ pl: '64px' }}>
                  <Typography sx={{ color: '#475569', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <BusinessIcon sx={{ fontSize: 16, color: '#94a3b8' }} /> {job.company_industry || 'Information Technology'}
                  </Typography>
                  {job.company_website && (
                    <Typography sx={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LanguageIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                      <a href={job.company_website} target="_blank" rel="noreferrer" style={{ color: '#0288d1', textDecoration: 'none', fontWeight: 500 }}>
                        {job.company_website.replace(/^https?:\/\//, '')}
                      </a>
                    </Typography>
                  )}
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>

      {/* Apply Modal */}
      <Modal
        open={showApplyModal}
        onClose={() => {
          if (!submitting) {
            setShowApplyModal(false);
            setMessage({ type: '', text: '' });
          }
        }}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Paper sx={{ width: '100%', maxWidth: 500, p: 4, borderRadius: '12px', outline: 'none', bgcolor: '#ffffff', border: '1px solid #e0f2fe' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
            Apply for {job.title}
          </Typography>
          <Typography sx={{ color: '#475569', fontSize: '14px', mb: 3 }}>
            at {job.company_name}
          </Typography>

          {message.text && (
            <Alert severity={message.type} sx={{ mb: 3, borderRadius: '8px' }}>
              {message.text}
            </Alert>
          )}

          <Box component="form" onSubmit={handleApplySubmit}>
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ color: '#0f172a', fontWeight: 600, fontSize: '14px', mb: 1 }}>Upload Resume</Typography>
              <Box
                sx={{
                  border: '2px dashed #e0f2fe',
                  borderRadius: '12px',
                  p: 3,
                  textAlign: 'center',
                  bgcolor: '#f0f9ff',
                  position: 'relative',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#0288d1', bgcolor: '#e0f7fa' }
                }}
              >
                <input
                  type="file"
                  required
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
                <CloudUploadIcon sx={{ fontSize: 40, color: '#0288d1', mb: 1 }} />
                {resumeFile ? (
                  <Typography sx={{ color: '#01579b', fontWeight: 700, fontSize: '14px' }}>
                    {resumeFile.name}
                  </Typography>
                ) : (
                  <>
                    <Typography sx={{ color: '#0f172a', fontWeight: 600, fontSize: '14px' }}>Click to upload file</Typography>
                    <Typography sx={{ color: '#94a3b8', fontSize: '12px', mt: 0.5 }}>PDF or Word files up to 10MB</Typography>
                  </>
                )}
              </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography sx={{ color: '#0f172a', fontWeight: 600, fontSize: '14px', mb: 1 }}>Cover Letter</Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                placeholder="Introduce yourself and explain why you are a great fit for this job..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                onClick={() => setShowApplyModal(false)}
                disabled={submitting}
                sx={{ color: '#475569', textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{
                  background: 'linear-gradient(135deg, #0288d1, #0ea5e9)',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '8px',
                  boxShadow: 'none',
                  px: 3
                }}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Application'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Modal>
    </Box>
  );
}
