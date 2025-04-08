// src/components/GenerateAISummary.js
import React, { useState } from 'react';
import { extractPbixMetadata, generateAISummary, updateDashboardSummary } from '../../utils/pbixAnalyzer';
import './GenerateAISummary.css';

const GenerateAISummary = ({ dashboardId, supabaseClient, onSummaryGenerated, onError }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !file.name.toLowerCase().endsWith('.pbix')) {
      onError('Please select a valid Power BI (.pbix) file');
      return;
    }
    
    try {
      setIsGenerating(true);
      setCurrentStep('Uploading file...');
      
      // Simulate file upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);
      
      // Step 1: Extract metadata from PBIX file
      setCurrentStep('Extracting metadata from dashboard...');
      const metadata = await extractPbixMetadata(file);
      setUploadProgress(100);
      clearInterval(progressInterval);
      
      // Step 2: Generate AI summary
      setCurrentStep('Generating AI insights...');
      const summary = await generateAISummary(metadata);
      
      // Step 3: Update database with summary
      setCurrentStep('Saving summary to database...');
      const updatedDashboard = await updateDashboardSummary(dashboardId, summary, supabaseClient);
      
      // Notify parent component
      onSummaryGenerated(updatedDashboard);
      
    } catch (error) {
      console.error('Error generating AI summary:', error);
      onError(error.message);
    } finally {
      setIsGenerating(false);
      setUploadProgress(0);
    }
  };
  
  if (isGenerating) {
    return (
      <div className="generating-summary">
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <div className="progress-text">{currentStep}</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="generate-ai-summary">
      <label htmlFor="pbix-upload" className="upload-pbix-button">
        Generate AI Summary
        <input
          id="pbix-upload"
          type="file"
          accept=".pbix"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />
      </label>
      <p className="upload-instruction">Upload the original .pbix file to generate insights</p>
    </div>
  );
};

export default GenerateAISummary;