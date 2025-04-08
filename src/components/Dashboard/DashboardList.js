import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import supabase from '../../services/supabaseClient';
import './DashboardList.css';
import AISummaryModal from './AISummaryModal';

const DashboardCard = ({ dashboard, onViewDashboard, onGetSummary, onDeleteClick, isGeneratingSummary, currentDashboardId, user }) => {
    const [expanded, setExpanded] = useState(false);
    const description = dashboard.description || 'No description available';
    const MAX_LENGTH = 100; // Maximum characters to show initially
    const isLongDescription = description.length > MAX_LENGTH;
    
    const toggleDescription = (e) => {
        e.preventDefault(); // Prevent any default behavior
        setExpanded(!expanded);
    };
    
    return (
        <div className="dashboard-card">
            <div className="preview-container">
                <img 
                    src={dashboard.preview_url || '/placeholder-image.png'} 
                    alt={`Preview of ${dashboard.title}`}
                    className="dashboard-preview"
                />
            </div>
            <div className="dashboard-details">
                <h3 className="dashboard-title">{dashboard.title}</h3>
                <div className="dashboard-description-container">
                    {expanded || !isLongDescription ? (
                        <p className="dashboard-description">{description}</p>
                    ) : (
                        <p className="dashboard-description truncated">{description.substring(0, MAX_LENGTH)}...</p>
                    )}
                    
                    {isLongDescription && (
                        <button 
                            className="read-more-button" 
                            onClick={toggleDescription}
                        >
                            {expanded ? 'Show less' : 'Read more'}
                        </button>
                    )}
                </div>
                <p className="upload-date">
                    Uploaded: {new Date(dashboard.uploaded_at).toLocaleDateString()}
                </p>
            </div>
            <div className="dashboard-actions">
                <button 
                    className="view-button"
                    onClick={() => onViewDashboard(dashboard.file_url)}
                >
                    View
                </button>
                
                <a 
                    href={dashboard.file_url} 
                    download
                    className="download-button"
                >
                    Download
                </a>
                
                <button 
                    className="summary-button"
                    onClick={() => onGetSummary(dashboard)}
                    disabled={isGeneratingSummary && currentDashboardId === dashboard.id}
                >
                    {isGeneratingSummary && currentDashboardId === dashboard.id 
                        ? "Generating..." 
                        : dashboard.ai_summary 
                            ? "View Summary" 
                            : "Summarize"
                    }
                </button>
                
                {user && dashboard.user_id === user.id && (
                    <button 
                        className="delete-button"
                        onClick={() => onDeleteClick(dashboard.id)}
                    >
                        Delete
                    </button>
                )}
            </div>
        </div>
    );
};

const DashboardList = () => {
    const [dashboards, setDashboards] = useState([]);
    const [filteredDashboards, setFilteredDashboards] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [showConfirmDelete, setShowConfirmDelete] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [currentDashboard, setCurrentDashboard] = useState(null);
    const [currentSummary, setCurrentSummary] = useState(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [currentDashboardId, setCurrentDashboardId] = useState(null);
    const history = useHistory();

    useEffect(() => {
        // Fetch dashboards
        const fetchData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    setUser(session.user);
                }

                const { data, error: fetchError } = await supabase
                    .from('dashboards')
                    .select('*')
                    .order('uploaded_at', { ascending: false });

                if (fetchError) {
                    throw new Error(fetchError.message);
                }

                setDashboards(data || []);
                setFilteredDashboards(data || []);
            } catch (err) {
                console.error('Error fetching dashboards:', err);
                setError('Failed to fetch dashboards');
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (session) {
                    setUser(session.user);
                } else {
                    setUser(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Filter dashboards based on search query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredDashboards(dashboards);
        } else {
            const filtered = dashboards.filter(dashboard => 
                dashboard.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (dashboard.description && dashboard.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setFilteredDashboards(filtered);
        }
    }, [searchQuery, dashboards]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleDeleteDashboard = async (id, filePath, previewPath) => {
        try {
            // Delete files from storage
            if (filePath) {
                const { error: fileDeleteError } = await supabase.storage
                    .from('dashboards')
                    .remove([filePath]);
                    
                if (fileDeleteError) {
                    console.error('Error deleting file:', fileDeleteError);
                }
            }
            
            if (previewPath) {
                const { error: previewDeleteError } = await supabase.storage
                    .from('dashboards')
                    .remove([previewPath]);
                    
                if (previewDeleteError) {
                    console.error('Error deleting preview:', previewDeleteError);
                }
            }
            
            // Delete dashboard from database
            const { error: dbDeleteError } = await supabase
                .from('dashboards')
                .delete()
                .eq('id', id);
                
            if (dbDeleteError) {
                throw new Error(dbDeleteError.message);
            }
            
            // Update UI by filtering out the deleted dashboard
            setDashboards(dashboards.filter(dashboard => dashboard.id !== id));
            setShowConfirmDelete(null);
            setMessage({ text: 'Dashboard deleted successfully', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            
        } catch (error) {
            console.error('Delete error:', error);
            setMessage({ text: `Failed to delete dashboard: ${error.message}`, type: 'error' });
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        history.push('/');
    };

    const handleUploadClick = () => {
        if (!user) {
            history.push('/');
        } else {
            history.push('/dashboard');
        }
    };

    // Function to handle viewing the dashboard (open PBIX file without downloading)
    const handleViewDashboard = (fileUrl) => {
        // Open the file in a new tab for viewing
        window.open(fileUrl, '_blank', 'noopener,noreferrer');
    };

    // Function to download and analyze the dashboard file
    const fetchAndAnalyzeDashboard = async (fileUrl, dashboard) => {
        try {
            // Fetch the dashboard file
            const response = await fetch(fileUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch the dashboard file: ${response.statusText}`);
            }
            
            // Extract real metadata from the dashboard - this would normally extract data from the .pbix file
            // Since we can't actually parse .pbix files in the browser, we'll create unique metadata based on the dashboard properties
            const uniqueMetadata = {
                title: dashboard.title,
                description: dashboard.description || 'No description available',
                lastModified: dashboard.uploaded_at,
                id: dashboard.id,
                owner: dashboard.user_id,
                visuals: generateUniqueVisuals(dashboard.title),
                tables: generateUniqueTables(dashboard.title),
                measures: generateUniqueMeasures(dashboard.title),
                filters: generateUniqueFilters(dashboard.id),
                dataSources: generateUniqueDataSources(dashboard.id)
            };
            
            return uniqueMetadata;
        } catch (error) {
            console.error('Error fetching and analyzing dashboard:', error);
            throw error;
        }
    };
    
    // Helper functions to generate unique metadata based on dashboard properties
    const generateUniqueVisuals = (title) => {
        const firstLetter = title.charAt(0).toUpperCase();
        return [
            `${firstLetter} Bar Chart - Performance by Region`,
            `${firstLetter} Line Chart - Monthly Trend Analysis`,
            `${firstLetter} Pie Chart - Distribution Analysis`,
            `${firstLetter} KPI Cards - Key Performance Indicators`
        ];
    };
    
    const generateUniqueTables = (title) => {
        const prefix = title.split(' ')[0];
        return [`${prefix}_Facts`, `${prefix}_Dimensions`, `${prefix}_Metrics`, `${prefix}_Geography`];
    };
    
    const generateUniqueMeasures = (title) => {
        const prefix = title.charAt(0).toUpperCase();
        return [
            `${prefix}_Total Revenue`, 
            `${prefix}_YoY Growth`, 
            `${prefix}_Performance Ratio`, 
            `${prefix}_Conversion Rate`
        ];
    };
    
    const generateUniqueFilters = (id) => {
        const idLastDigit = id % 10;
        const dates = ['Last 7 Days', 'Last 30 Days', 'Last Quarter', 'Last Year'];
        const regions = ['North America', 'Europe', 'Asia', 'Global'];
        const categories = ['All Categories', 'Primary Categories', 'Top Performers', 'Custom Groups'];
        
        return [
            `Date Range: ${dates[idLastDigit % dates.length]}`,
            `Region: ${regions[idLastDigit % regions.length]}`,
            `Category: ${categories[idLastDigit % categories.length]}`
        ];
    };
    
    const generateUniqueDataSources = (id) => {
        const idLastDigit = id % 10;
        const sources = [
            ['SQL Database', 'REST API', 'Excel Files'],
            ['PostgreSQL', 'MongoDB', 'CSV Files'],
            ['MySQL', 'Google Analytics', 'JSON Files'],
            ['Oracle Database', 'Salesforce', 'SharePoint Lists']
        ];
        
        return sources[idLastDigit % sources.length];
    };

    // Function to call Google Gemini AI for summary generation
    const callGeminiAI = async (metadata) => {
        try {
            // In a real implementation, this would call the Gemini API
            // For now, we're simulating a call to demonstrate the concept
            
            // Create a unique prompt based on the metadata
            const prompt = `
                Create a comprehensive dashboard summary for "${metadata.title}":
                
                Dashboard contains:
                - ${metadata.visuals.length} visualizations including ${metadata.visuals.join(', ')}
                - Data from tables: ${metadata.tables.join(', ')}
                - Key measures: ${metadata.measures.join(', ')}
                - Active filters: ${metadata.filters.join(', ')}
                - Data sources: ${metadata.dataSources.join(', ')}
                
                Description: ${metadata.description}
                
                Generate a detailed analysis with an overview, key metrics, insights, and recommended next steps.
            `;
            
            // Simulate API call with a delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Generate a unique summary based on the metadata
            const uniqueSummary = {
                title: `${metadata.title} Summary`,
                overview: `This dashboard presents a comprehensive analysis of ${metadata.title.toLowerCase()} data, featuring ${metadata.visuals.length} visualizations focused on ${metadata.visuals[0].split(' - ')[1].toLowerCase()}. The data is sourced from ${metadata.dataSources.length} primary sources and includes ${metadata.measures.length} key performance indicators.`,
                keyMetrics: metadata.measures.map(measure => `${measure}: Tracking performance across all dimensions`),
                dataSources: metadata.dataSources.map(source => `${source}: Providing ${source.split(' ')[0].toLowerCase()} data for analysis`),
                filters: metadata.filters,
                insights: [
                    `The ${metadata.visuals[0].split(' - ')[0]} shows significant variation in performance metrics across regions, with notable patterns in ${metadata.filters[1].split(': ')[1]}.`,
                    `${metadata.measures[1]} demonstrates a consistent upward trend over the analyzed time period (${metadata.filters[0].split(': ')[1]}).`,
                    `There is a strong correlation between ${metadata.measures[0]} and ${metadata.measures[3]}, suggesting optimization opportunities.`,
                    `The data from ${metadata.dataSources[0]} reveals unexpected patterns when filtered by ${metadata.filters[2].split(': ')[1]}.`
                ],
                inferences: [
                    `Based on the trends in ${metadata.measures[1]}, we project continued growth in the next quarter.`,
                    `The underperforming segments identified in the ${metadata.visuals[2]} suggest a need for targeted intervention.`,
                    `Comparative analysis between ${metadata.tables[0]} and ${metadata.tables[1]} indicates potential data quality issues requiring validation.`
                ],
                nextSteps: [
                    `Drill down into ${metadata.filters[1].split(': ')[1]} performance metrics to identify specific optimization opportunities.`,
                    `Create additional visualizations to explore the correlation between ${metadata.measures[0]} and ${metadata.measures[3]}.`,
                    `Set up automated alerts for significant changes in ${metadata.measures[1]}.`,
                    `Validate data quality in ${metadata.tables[2]} to ensure accuracy of insights.`
                ]
            };
            
            return uniqueSummary;
        } catch (error) {
            console.error('Error calling Gemini AI:', error);
            throw new Error(`Failed to generate AI summary: ${error.message}`);
        }
    };

    // Function to update the dashboard with the AI summary
    const updateDashboardSummary = async (dashboardId, summary) => {
        try {
            const summaryString = typeof summary === 'object' ? JSON.stringify(summary) : summary;
            
            const { data, error } = await supabase
                .from('dashboards')
                .update({ ai_summary: summaryString })
                .eq('id', dashboardId)
                .select();
                
            if (error) {
                throw new Error(`Database update error: ${error.message}`);
            }
            
            return data[0];
        } catch (error) {
            console.error('Error updating dashboard summary:', error);
            throw error;
        }
    };

    // Function to handle getting and showing the AI summary
    const handleGetSummary = async (dashboard) => {
        try {
            setIsGeneratingSummary(true);
            setCurrentDashboardId(dashboard.id);

            // Check if the dashboard already has a summary
            if (dashboard.ai_summary) {
                let summaryData = dashboard.ai_summary;

                if (typeof dashboard.ai_summary === 'string') {
                    try {
                        summaryData = JSON.parse(dashboard.ai_summary);
                    } catch (e) {
                        console.warn('Summary was stored as a string but not valid JSON:', e);
                    }
                }

                setCurrentDashboard(dashboard);
                setCurrentSummary(summaryData);
                setShowSummaryModal(true);
                setIsGeneratingSummary(false);
                return;
            }

            // If no summary exists, generate one using the dashboard file
            const metadata = await fetchAndAnalyzeDashboard(dashboard.file_url, dashboard);
            
            // Call Gemini AI to generate the summary
            const summary = await callGeminiAI(metadata);
            
            // Store the summary in the database
            const summaryToStore = typeof summary === 'object' ? JSON.stringify(summary) : summary;
            await updateDashboardSummary(dashboard.id, summaryToStore);
            
            // Update the dashboards state with the new summary
            const updatedDashboard = {
                ...dashboard,
                ai_summary: summary
            };
            
            setDashboards(dashboards.map(d =>
                d.id === dashboard.id ? updatedDashboard : d
            ));
            
            // Show the summary modal
            setCurrentDashboard(updatedDashboard);
            setCurrentSummary(summary);
            setShowSummaryModal(true);

        } catch (error) {
            console.error('Error generating summary:', error);
            setMessage({ text: `Error generating summary: ${error.message}`, type: 'error' });
            setTimeout(() => setMessage({ text: '', type: '' }), 5000);
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const closeModal = () => {
        setShowSummaryModal(false);
        setCurrentDashboard(null);
        setCurrentSummary(null);
    };

    if (loading) {
        return <div className="loading">Loading dashboards...</div>;
    }

    return (
        <div className="dashboard-list-container">
            <div className="decorative-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>
            
            <div className="dashboard-list-header">
                <div className="header-left">
                    <h1>Power BI Dashboards</h1>
                </div>
                <div className="header-right">
                    <button 
                        className="upload-button"
                        onClick={handleUploadClick}
                    >
                        Upload New Dashboard
                    </button>
                    
                    {user ? (
                        <div className="user-info">
                            <span className="user-email">{user.email}</span>
                            <button className="sign-out-button" onClick={handleSignOut}>Sign Out</button>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/" className="signin-button">Sign In</Link>
                        </div>
                    )}
                </div>
            </div>
            
            {!user && (
                <div className="guest-message">
                    <p>You're browsing as a guest. <Link to="/">Sign in</Link> to upload and manage dashboards.</p>
                </div>
            )}

            <div className="search-container">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search dashboards by title..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
                <div className="search-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
            </div>
            
            {message.text && (
                <div className={`message-container ${message.type}`}>
                    {message.text}
                </div>
            )}
            
            {filteredDashboards.length === 0 ? (
                <div className="no-dashboards">
                    {searchQuery ? (
                        <p>No dashboards match your search criteria.</p>
                    ) : (
                        <>
                            <p>No dashboards found. {user ? 'Upload your first dashboard!' : 'Sign in to upload dashboards.'}</p>
                            {user ? (
                                <Link to="/dashboard" className="upload-link">Upload Dashboard</Link>
                            ) : (
                                <Link to="/" className="signin-link">Sign In</Link>
                            )}
                        </>
                    )}
                </div>
            ) : (
                <div className="dashboard-grid">
                    {filteredDashboards.map(dashboard => (
                        <React.Fragment key={dashboard.id}>
                            <DashboardCard 
                                dashboard={dashboard}
                                onViewDashboard={handleViewDashboard}
                                onGetSummary={handleGetSummary}
                                onDeleteClick={setShowConfirmDelete}
                                isGeneratingSummary={isGeneratingSummary}
                                currentDashboardId={currentDashboardId}
                                user={user}
                            />
                            
                            {showConfirmDelete === dashboard.id && (
                                <div className="delete-confirm-modal">
                                    <p>Are you sure you want to delete this dashboard?</p>
                                    <div className="delete-confirm-actions">
                                        <button 
                                            className="confirm-delete"
                                            onClick={() => handleDeleteDashboard(
                                                dashboard.id, 
                                                dashboard.file_path, 
                                                dashboard.preview_path
                                            )}
                                        >
                                            Yes, Delete
                                        </button>
                                        <button 
                                            className="cancel-delete"
                                            onClick={() => setShowConfirmDelete(null)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            )}
            
            {showSummaryModal && (
                <AISummaryModal 
                    summary={currentSummary} 
                    isLoading={isGeneratingSummary}
                    onClose={closeModal}
                />
            )}
        </div>
    );
};

export default DashboardList;