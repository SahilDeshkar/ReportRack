import React, { useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import supabase from '../../services/supabaseClient';
import './Dashboard.css';

const Dashboard = () => {
    const [file, setFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState(null);
    const history = useHistory();

    // Check authentication status on component mount
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                history.push('/');
                return;
            }
            setUser(session.user);
        };
        
        checkAuth();
        
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'SIGNED_OUT') {
                    history.push('/');
                } else if (session) {
                    setUser(session.user);
                }
            }
        );
        
        // Cleanup subscription
        return () => subscription.unsubscribe();
    }, [history]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.name.endsWith('.pbix')) {
            setFile(selectedFile);
        } else {
            setMessage('Please select a valid .pbix file');
            e.target.value = null;
        }
    };

    const handlePreviewChange = (e) => {
        const selectedImage = e.target.files[0];
        if (selectedImage && selectedImage.type.startsWith('image/')) {
            setPreviewImage(selectedImage);
        } else {
            setMessage('Please select a valid image file');
            e.target.value = null;
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setMessage('');
        
        // Validate inputs
        if (!file || !previewImage || !title || !description) {
            setMessage('Please fill in all fields.');
            return;
        }

        try {
            setUploading(true);
            
            // Generate unique filenames to prevent overwriting
            const timestamp = new Date().getTime();
            const safeTitle = title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
            const fileExt = file.name.split('.').pop();
            const previewExt = previewImage.name.split('.').pop();
            
            // Ensure paths begin with user.id to enforce correct ownership
            const fileKey = `${user.id}/files/${timestamp}_${safeTitle}.${fileExt}`;
            const previewKey = `${user.id}/previews/${timestamp}_${safeTitle}.${previewExt}`;
            
            // Upload the .pbix file
            console.log('Uploading .pbix file...');
            const { data: fileData, error: fileError } = await supabase.storage
                .from('dashboards')
                .upload(fileKey, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (fileError) {
                throw new Error(`File upload error: ${fileError.message}`);
            }

            // Upload the preview image
            console.log('Uploading preview image...');
            const { data: previewData, error: previewError } = await supabase.storage
                .from('dashboards')
                .upload(previewKey, previewImage, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (previewError) {
                // If the file upload succeeded but preview failed, try to clean up the file
                await supabase.storage.from('dashboards').remove([fileKey]);
                throw new Error(`Preview upload error: ${previewError.message}`);
            }

            // Get public URLs for the uploaded files - ensure they're signed URLs for private buckets
            const { data: { publicUrl: fileUrl } } = supabase.storage
                .from('dashboards')
                .getPublicUrl(fileKey);
                
            const { data: { publicUrl: previewUrl } } = supabase.storage
                .from('dashboards')
                .getPublicUrl(previewKey);

            // Save metadata to the database
            console.log('Saving metadata to database...');
            const { error: dbError } = await supabase.from('dashboards').insert([
                {
                    title,
                    description,
                    file_path: fileKey,
                    preview_path: previewKey,
                    file_url: fileUrl,
                    preview_url: previewUrl,
                    uploaded_at: new Date().toISOString(),
                    user_id: user.id  // Explicitly store user_id to enforce ownership
                },
            ]);

            if (dbError) {
                // If database insertion failed, clean up uploaded files
                await supabase.storage.from('dashboards').remove([
                    fileKey,
                    previewKey
                ]);
                throw new Error(`Database insertion error: ${dbError.message}`);
            }

            // Reset form on success
            setTitle('');
            setDescription('');
            setFile(null);
            setPreviewImage(null);
            
            // Update UI with success message
            setMessage('Dashboard uploaded successfully!');
            
            // Reset form inputs
            document.getElementById('fileInput').value = '';
            document.getElementById('previewInput').value = '';
            
            // Redirect to browse page after successful upload
            setTimeout(() => {
                history.push('/browse');
            }, 2000);
            
        } catch (error) {
            console.error('Upload error:', error);
            setMessage(`Failed to upload dashboard: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        history.push('/');
    };

    if (!user) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>ReportRack</h1>
                    <p>Upload your Power BI dashboards and manage them here.</p>
                </div>
                <div className="user-controls">
                    <div className="navigation-links">
                        <Link to="/browse" className="nav-link">Browse Dashboards</Link>
                    </div>
                    <span className="user-email">{user.email}</span>
                    <button className="sign-out-btn" onClick={handleSignOut}>Sign Out</button>
                </div>
            </div>
            
            <div className="dashboard-content">
                <form className="dashboard-form" onSubmit={handleUpload}>
                    <h2>Upload New Dashboard</h2>
                    
                    <div className="form-group">
                        <label htmlFor="titleInput">Dashboard Title</label>
                        <input
                            id="titleInput"
                            type="text"
                            placeholder="Enter title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={uploading}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="descriptionInput">Dashboard Description</label>
                        <textarea
                            id="descriptionInput"
                            placeholder="Enter description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={uploading}
                            rows="4"
                        />
                    </div>
                    
                    <div className="form-group file-input-group">
                        <label htmlFor="fileInput">Dashboard File (.pbix)</label>
                        <div className="file-input-wrapper">
                            <input 
                                id="fileInput" 
                                type="file" 
                                accept=".pbix" 
                                onChange={handleFileChange}
                                disabled={uploading}
                            />
                            <span className="file-name">{file ? file.name : 'No file selected'}</span>
                        </div>
                    </div>
                    
                    <div className="form-group file-input-group">
                        <label htmlFor="previewInput">Preview Image</label>
                        <div className="file-input-wrapper">
                            <input 
                                id="previewInput" 
                                type="file" 
                                accept="image/*" 
                                onChange={handlePreviewChange}
                                disabled={uploading}
                            />
                            <span className="file-name">{previewImage ? previewImage.name : 'No image selected'}</span>
                        </div>
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={uploading}
                        className={uploading ? 'uploading' : ''}
                    >
                        {uploading ? 'Uploading...' : 'Upload Dashboard'}
                    </button>
                </form>
                
                {message && (
                    <div className={`message-container ${message.includes('Failed') || message.includes('Please') ? 'error' : 'success'}`}>
                        <p>{message}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;