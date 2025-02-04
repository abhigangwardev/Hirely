// components/PersonalDetail.js
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResumeInfoContext } from '@/context/ResumeInfoContext';
import { LoaderCircle } from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import axios from 'axios'; // Import Axios
import { toast } from 'sonner';

function PersonalDetail({ enabledNext }) {
    const params = useParams();
    const { getToken } = useAuth(); 
    const { resumeInfo, setResumeInfo } = useContext(ResumeInfoContext);

    const [formData, setFormData] = useState({
        "personalDetails":{firstName: '',
        lastName: '',
        jobTitle: '',
        address: '',
        phone: '',
        email: '',}
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Initialize form data with resumeInfo if available
        if (resumeInfo) {
            setFormData({
                "personalDetails":{
                firstName: resumeInfo.firstName || '',
                lastName: resumeInfo.lastName || '',
                jobTitle: resumeInfo.jobTitle || '',
                address: resumeInfo.address || '',
                phone: resumeInfo.phone || '',
                email: resumeInfo.email || '',}
            });
        }
    }, [resumeInfo]);

    const handleInputChange = (e) => {
        enabledNext(false);
        const { name, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        setResumeInfo((prevInfo) => ({
            ...prevInfo,
            [name]: value,
        }));
    };

    const onSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        const data = {
            data: formData, // Ensure formData contains the correct fields
        };
    
        try {
            const id = params?.resumeId;
            const token = await getToken();
            console.log('Request data:', data);
            console.log(id);
            const response = await axios.put(`http://localhost:5000/api/dashboard/resume/${id}/edit`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response);
            enabledNext(true);
            toast("Details updated");
        } catch (error) {
            console.error('Error updating resume:', error);
            toast.error("Failed to update details");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='p-5 shadow-lg rounded-lg border-t-primary border-t-4 mt-10'>
            <h2 className='font-bold text-lg'>Personal Detail</h2>
            <p>Get Started with the basic information</p>

            <form onSubmit={onSave}>
                <div className='grid grid-cols-2 mt-5 gap-3'>
                    <div>
                        <label className='text-sm'>First Name</label>
                        <Input name="firstName" value={formData.firstName} required onChange={handleInputChange} />
                    </div>
                    <div>
                        <label className='text-sm'>Last Name</label>
                        <Input name="lastName" required onChange={handleInputChange} value={formData.lastName} />
                    </div>
                    <div className='col-span-2'>
                        <label className='text-sm'>Job Title</label>
                        <Input name="jobTitle" required value={formData.jobTitle} onChange={handleInputChange} />
                    </div>
                    <div className='col-span-2'>
                        <label className='text-sm'>Address</label>
                        <Input name="address" required value={formData.address} onChange={handleInputChange} />
                    </div>
                    <div>
                        <label className='text-sm'>Phone</label>
                        <Input name="phone" required value={formData.phone} onChange={handleInputChange} />
                    </div>
                    <div>
                        <label className='text-sm'>Email</label>
                        <Input name="email" required value={formData.email} onChange={handleInputChange} />
                    </div>
                </div>
                <div className='mt-3 flex justify-end'>
                    <Button type="submit" disabled={loading}>
                        {loading ? <LoaderCircle className='animate-spin' /> : 'Save'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default PersonalDetail;