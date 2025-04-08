// src/components/AISummaryModal.js
import React, { useState, useEffect } from 'react';
import './AISummaryModal.css';

const AISummaryModal = ({ summary, isLoading, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [processedSummary, setProcessedSummary] = useState(null);
  
  useEffect(() => {
    // Process and validate the summary data
    if (summary && typeof summary === 'object') {
      // Ensure all required properties exist with fallbacks
      setProcessedSummary({
        title: summary.title || 'Dashboard Summary',
        overview: summary.overview || 'No overview available.',
        keyMetrics: Array.isArray(summary.keyMetrics) ? summary.keyMetrics : [],
        dataSources: Array.isArray(summary.dataSources) ? summary.dataSources : [],
        filters: Array.isArray(summary.filters) ? summary.filters : [],
        insights: Array.isArray(summary.insights) ? summary.insights : [],
        inferences: Array.isArray(summary.inferences) ? summary.inferences : [],
        nextSteps: Array.isArray(summary.nextSteps) ? summary.nextSteps : []
      });
    } else if (summary && typeof summary === 'string') {
      // Try to parse string as JSON
      try {
        const parsedSummary = JSON.parse(summary);
        setProcessedSummary({
          title: parsedSummary.title || 'Dashboard Summary',
          overview: parsedSummary.overview || 'No overview available.',
          keyMetrics: Array.isArray(parsedSummary.keyMetrics) ? parsedSummary.keyMetrics : [],
          dataSources: Array.isArray(parsedSummary.dataSources) ? parsedSummary.dataSources : [],
          filters: Array.isArray(parsedSummary.filters) ? parsedSummary.filters : [],
          insights: Array.isArray(parsedSummary.insights) ? parsedSummary.insights : [],
          inferences: Array.isArray(parsedSummary.inferences) ? parsedSummary.inferences : [],
          nextSteps: Array.isArray(parsedSummary.nextSteps) ? parsedSummary.nextSteps : []
        });
      } catch (e) {
        console.error('Error parsing summary JSON:', e);
        setProcessedSummary(null);
      }
    } else {
      setProcessedSummary(null);
    }
  }, [summary]);
  
  if (isLoading) {
    return (
      <div className="ai-summary-modal">
        <div className="ai-summary-content">
          <div className="ai-summary-header">
            <h2>Generating AI Summary...</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="ai-summary-loading">
            <div className="spinner"></div>
            <p>Analyzing dashboard data and generating insights...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!processedSummary) {
    return (
      <div className="ai-summary-modal">
        <div className="ai-summary-content">
          <div className="ai-summary-header">
            <h2>AI Summary Unavailable</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="ai-summary-error">
            <p>Unable to generate AI summary for this dashboard.</p>
            <p className="error-details">The summary data is missing or in an unexpected format.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="ai-summary-modal">
      <div className="ai-summary-content">
        <div className="ai-summary-header">
          <h2>{processedSummary.title || 'Dashboard Summary'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="ai-summary-tabs">
          <button 
            className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            Insights
          </button>
          <button 
            className={`tab ${activeTab === 'next-steps' ? 'active' : ''}`}
            onClick={() => setActiveTab('next-steps')}
          >
            Next Steps
          </button>
        </div>
        
        <div className="ai-summary-body">
          {activeTab === 'overview' && (
            <div className="tab-content">
              <p className="overview">{processedSummary.overview}</p>
              
              {processedSummary.keyMetrics.length > 0 && (
                <div className="metadata-section">
                  <h3>Key Metrics</h3>
                  <ul className="metadata-list">
                    {processedSummary.keyMetrics.map((metric, index) => (
                      <li key={`metric-${index}`}>{metric}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {processedSummary.dataSources.length > 0 && (
                <div className="metadata-section">
                  <h3>Data Sources</h3>
                  <ul className="metadata-list">
                    {processedSummary.dataSources.map((source, index) => (
                      <li key={`source-${index}`}>{source}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {processedSummary.filters.length > 0 && (
                <div className="metadata-section">
                  <h3>Filters</h3>
                  <ul className="metadata-list">
                    {processedSummary.filters.map((filter, index) => (
                      <li key={`filter-${index}`}>{filter}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'insights' && (
            <div className="tab-content">
              {processedSummary.insights.length > 0 && (
                <div className="insights-section">
                  <h3>Key Insights</h3>
                  <ul className="insights-list">
                    {processedSummary.insights.map((insight, index) => (
                      <li key={`insight-${index}`}>{insight}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {processedSummary.inferences.length > 0 && (
                <div className="insights-section">
                  <h3>Inferences</h3>
                  <ul className="insights-list">
                    {processedSummary.inferences.map((inference, index) => (
                      <li key={`inference-${index}`}>{inference}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {processedSummary.insights.length === 0 && processedSummary.inferences.length === 0 && (
                <p className="no-data-message">No insights available for this dashboard.</p>
              )}
            </div>
          )}
          
          {activeTab === 'next-steps' && (
            <div className="tab-content">
              {processedSummary.nextSteps.length > 0 ? (
                <div className="next-steps-section">
                  <h3>Recommended Next Steps</h3>
                  <ol className="next-steps-list">
                    {processedSummary.nextSteps.map((step, index) => (
                      <li key={`step-${index}`}>{step}</li>
                    ))}
                  </ol>
                </div>
              ) : (
                <p className="no-data-message">No next steps available for this dashboard.</p>
              )}
            </div>
          )}
        </div>
        
        <div className="ai-summary-footer">
          <p>Generated by Google Gemini AI</p>
        </div>
      </div>
    </div>
  );
};

export default AISummaryModal;