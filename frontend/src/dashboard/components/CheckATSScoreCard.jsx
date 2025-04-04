import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

function CheckATSScoreCard({ onCheckScore }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState('');
  const navigate = useNavigate();

  const validateFile = (file) => {
    // Check if file is a PDF or DOCX
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      return 'Only PDF and DOCX files are supported';
    }
    
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return 'File size should be less than 5MB';
    }
    
    return '';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validateFile(file);
      setFileError(error);
      setResumeFile(error ? null : file);
    } else {
      setResumeFile(null);
      setFileError('');
    }
  };

  const handleCheckScore = async () => {
    if (!resumeFile || !jobDescription) {
      toast.error('Resume file and job description are required');
      return;
    }

    setLoading(true);
    try {
      const result = await onCheckScore(resumeFile, jobDescription);
      
      // Debug info
      console.log('ATS Score Result:', result);
      
      if (result && result.data && result.data.atsScore) {
        // Convert the resume file to base64 for preview
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64File = reader.result.split(',')[1]; // Extract base64 data
          
          // Navigate to the ATS score result page with the score and resume file
          navigate('/dashboard/ats-score-result', {
            state: { 
              atsScore: result.data.atsScore, 
              resumeFile: base64File,
              jobDescription: result.data.jobDescription 
            },
          });
        };
        reader.readAsDataURL(resumeFile); // Read the file as base64
        setOpenDialog(false);
      } else {
        toast.error('Failed to check ATS score. Please try again.');
      }
    } catch (error) {
      console.error('Error checking ATS score:', error);
      toast.error('Failed to check ATS score. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Check ATS Score Card */}
      <div
        className='p-4 border-2 border-dashed border-blue-200 rounded-lg flex flex-col items-center justify-center h-[120px] w-[200px] hover:bg-blue-50 transition-all duration-300 cursor-pointer group'
        onClick={() => setOpenDialog(true)}
      >
        <CheckCircle className='w-7 h-7 text-blue-500 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-300' />
        <p className='mt-2 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors duration-300'>Check ATS Score</p>
      </div>

      {/* Dialog for Checking ATS Score */}
      <Dialog open={openDialog} onOpenChange={(open) => {
        setOpenDialog(open);
        if (!open) {
          setResumeFile(null);
          setJobDescription('');
          setFileError('');
        }
      }}>
        <DialogContent className="bg-white rounded-xl border border-gray-100 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Check ATS Score</DialogTitle>
            <DialogDescription>
              Upload your resume and provide a job description to check the ATS score.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-2 space-y-3">
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Resume File</label>
              <Input
                type='file'
                name="pdf_doc"
                className="w-full"
                accept=".pdf,.docx"
                onChange={handleFileChange}
              />
              {fileError && (
                <p className="text-sm text-red-500 mt-1">{fileError}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm text-gray-700 mb-1 block">Job Description</label>
              <Textarea
                placeholder='Paste the job description here'
                className="w-full min-h-[120px]"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>
          </div>
          
          <div className='flex justify-end gap-5'>
            <Button 
              onClick={() => setOpenDialog(false)} 
              variant='ghost'
              className="rounded-md hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button 
              disabled={!resumeFile || !jobDescription || loading || fileError} 
              onClick={handleCheckScore}
              className="rounded-md bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {loading ? <Loader2 className='animate-spin mr-2' /> : 'Check Score'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CheckATSScoreCard;