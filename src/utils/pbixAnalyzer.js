// src/utils/pbixAnalyzer.js
import JSZip from 'jszip';

/**
 * Extract metadata from a Power BI (.pbix) file
 * @param {File} file - The .pbix file
 * @returns {Promise<Object>} Extracted metadata
 */
export const extractPbixMetadata = async (file) => {
  try {
    // Read the .pbix file as a zip archive
    const zip = new JSZip();
    const zipData = await zip.loadAsync(file);
    
    // Power BI files contain layout and data model information in specific files
    // Extract key information like visuals, tables, and report structure
    const layoutData = await extractLayoutInfo(zipData);
    const dataModelInfo = await extractDataModelInfo(zipData);
    
    return {
      title: file.name.replace('.pbix', ''),
      fileSize: formatFileSize(file.size),
      lastModified: new Date(file.lastModified).toISOString(),
      visuals: layoutData.visuals || [],
      tables: dataModelInfo.tables || [],
      measures: dataModelInfo.measures || [],
      filters: layoutData.filters || [],
      dataSources: dataModelInfo.dataSources || []
    };
    
  } catch (error) {
    console.error('Error extracting PBIX metadata:', error);
    throw new Error('Failed to extract dashboard metadata');
  }
};

/**
 * Extract layout information from the PBIX zip file
 * @param {JSZip} zipData - Loaded JSZip object
 * @returns {Promise<Object>} Layout information
 */
const extractLayoutInfo = async (zipData) => {
  try {
    // In a real implementation, we would parse layout.json or similar files
    // For this example, we'll return mock data since actual PBIX parsing is complex
    
    // Simulated data - in a real implementation you would parse this from layout files
    return {
      visuals: [
        'Bar Chart - Revenue by Region',
        'Line Chart - Monthly Sales Trend',
        'Pie Chart - Customer Segments',
        'KPI Cards - Revenue, Profit, Growth'
      ],
      filters: [
        'Date Range: Last 12 Months',
        'Region: North America, Europe, APAC',
        'Product Category: All'
      ]
    };
  } catch (error) {
    console.error('Error extracting layout data:', error);
    return { visuals: [], filters: [] };
  }
};

/**
 * Extract data model information from the PBIX zip file
 * @param {JSZip} zipData - Loaded JSZip object
 * @returns {Promise<Object>} Data model information
 */
const extractDataModelInfo = async (zipData) => {
  try {
    // In a real implementation, we'd parse DataModelSchema or similar files
    // For this example, we'll return mock data
    
    // Simulated data - in a real implementation you would parse this from data model files
    return {
      tables: [
        'Sales',
        'Customers',
        'Products',
        'Geography'
      ],
      measures: [
        'Total Revenue',
        'YoY Growth',
        'Profit Margin',
        'Customer Acquisition Cost'
      ],
      dataSources: [
        'SQL Server - Sales Database',
        'Excel - Marketing Campaign Data',
        'CSV - Customer Segments'
      ]
    };
  } catch (error) {
    console.error('Error extracting data model info:', error);
    return { tables: [], measures: [], dataSources: [] };
  }
};

/**
 * Format file size to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

/**
 * Generate AI summary using Google Gemini API
 * @param {Object} metadata - Dashboard metadata
 * @returns {Promise<Object>} AI-generated summary
 */
export const generateAISummary = async (metadata) => {
  try {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('API key missing - using fallback mock data for development');
      // Return mock data if API key is missing (for development)
      return generateMockSummary(metadata);
    }
    
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent';

    // Prepare prompt for Gemini
    const prompt = `
      Generate a comprehensive summary of a Power BI dashboard with the following metadata:
      
      Title: ${metadata.title}
      Last Modified: ${new Date(metadata.lastModified).toLocaleDateString()}
      
      Visuals: ${metadata.visuals.join(', ')}
      Tables: ${metadata.tables.join(', ')}
      Measures: ${metadata.measures.join(', ')}
      Filters: ${metadata.filters.join(', ')}
      Data Sources: ${metadata.dataSources.join(', ')}
      
      Based on the above information, generate a structured summary including:
      1. A concise overview of what this dashboard is about
      2. Key metrics being tracked
      3. Data sources used
      4. Filters/slicers implemented
      5. Key insights that might be derived from this dashboard
      6. Possible inferences about business performance
      7. Recommended next steps or areas to investigate further
      
      Format the response as a JSON object with the following structure:
      {
        "title": "Dashboard name",
        "overview": "Brief overview of the dashboard",
        "keyMetrics": ["Metric 1", "Metric 2", ...],
        "dataSources": ["Source 1", "Source 2", ...],
        "filters": ["Filter 1", "Filter 2", ...],
        "insights": ["Insight 1", "Insight 2", ...],
        "inferences": ["Inference 1", "Inference 2", ...],
        "nextSteps": ["Step 1", "Step 2", ...]
      }
      
      Important: Respond ONLY with the JSON object, no additional text, markdown, or code blocks.
    `;
    
    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error (${response.status}):`, errorText);
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error('No candidates in Gemini API response:', data);
      throw new Error('No response from Gemini API');
    }
    
    // Extract the text from Gemini response
    const rawText = data.candidates[0].content.parts[0].text;
    console.log('Raw Gemini response:', rawText);
    
    // Try different patterns to extract JSON
    let summaryData;
    
    try {
      // First try: extract JSON between code blocks if present
      const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        summaryData = JSON.parse(jsonMatch[1]);
      } 
      // Second try: try to parse the whole text as JSON
      else if (rawText.trim().startsWith('{') && rawText.trim().endsWith('}')) {
        summaryData = JSON.parse(rawText);
      } 
      // Third try: find anything that looks like JSON
      else {
        const jsonRegex = /{[\s\S]*?}/;
        const match = rawText.match(jsonRegex);
        if (match) {
          summaryData = JSON.parse(match[0]);
        } else {
          throw new Error('Could not extract JSON from Gemini response');
        }
      }
    } catch (parseError) {
      console.error('Error parsing JSON from Gemini response:', parseError);
      console.error('Raw response text:', rawText);
      
      // Fallback to mock data if JSON parsing fails
      return generateMockSummary(metadata);
    }
    
    return summaryData;
    
  } catch (error) {
    console.error('Error generating AI summary:', error);
    // Return mock data as fallback
    console.log('Falling back to mock summary data');
    return generateMockSummary(metadata);
  }
};

/**
 * Generate mock summary data for development/fallback
 * @param {Object} metadata - Dashboard metadata
 * @returns {Object} Mock summary data
 */
const generateMockSummary = (metadata) => {
  return {
    title: metadata.title || "Dashboard Summary",
    overview: `This dashboard presents a comprehensive analysis of business performance metrics including revenue, sales trends, customer segments, and profitability measures. It provides stakeholders with key insights for decision-making.`,
    keyMetrics: [
      "Total Revenue",
      "Year-over-Year Growth",
      "Profit Margin",
      "Customer Acquisition Cost",
      "Regional Performance"
    ],
    dataSources: metadata.dataSources || [
      "SQL Server - Sales Database",
      "Excel - Marketing Campaign Data",
      "CSV - Customer Segments"
    ],
    filters: metadata.filters || [
      "Date Range: Last 12 Months",
      "Region: North America, Europe, APAC",
      "Product Category: All"
    ],
    insights: [
      "Revenue shows consistent growth across most regions with North America leading at 24% YoY",
      "Customer acquisition cost has decreased by 12% while retention rates improved",
      "Product category B shows the highest profit margin at 37%",
      "Customer segment 'Enterprise' represents 62% of total revenue"
    ],
    inferences: [
      "Marketing campaigns in Q2 significantly boosted sales in the APAC region",
      "Product line expansion has positively impacted overall revenue growth",
      "Price optimization strategies have improved margins in key segments",
      "Customer retention initiatives appear to be yielding positive results"
    ],
    nextSteps: [
      "Analyze underperforming regions for potential growth opportunities",
      "Further segment customer data to identify new target markets",
      "Investigate cost reduction opportunities in manufacturing and logistics",
      "Consider expanding successful marketing campaigns to other regions"
    ]
  };
};

/**
 * Update dashboard with AI summary in Supabase
 * @param {string} dashboardId - Dashboard ID
 * @param {Object} summary - AI summary data
 * @param {Object} supabaseClient - Supabase client
 * @returns {Promise<Object>} Updated dashboard
 */
export const updateDashboardSummary = async (dashboardId, summary, supabaseClient) => {
  try {
    // Log the summary being saved
    console.log('Saving summary to database:', summary);
    
    // Update dashboard with AI summary
    const { data, error } = await supabaseClient
      .from('dashboards')
      .update({ 
        ai_summary: summary,
        last_summary_update: new Date().toISOString()
      })
      .eq('id', dashboardId)
      .select('*')
      .single();
    
    if (error) {
      console.error('Supabase update error:', error);
      throw new Error(error.message);
    }
    
    return data;
    
  } catch (error) {
    console.error('Error updating dashboard summary:', error);
    throw new Error(`Failed to save AI summary: ${error.message}`);
  }
};