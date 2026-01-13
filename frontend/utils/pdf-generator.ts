import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { ReportData } from '@/services/report-service';

interface DetailedReportData extends Omit<ReportData, 'timeOfRescue'> {
  // Additional fields that might come from the detailed endpoint
  timeOfRescue?: string | null;
}

/**
 * Format a date string to a readable format
 */
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

/**
 * Format time from date string
 */
const formatTime = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'N/A';
  }
};

/**
 * Generate HTML template for the rescue operation report PDF
 */
const generateReportHTML = (data: DetailedReportData): string => {
  // Parse resources used if it's a JSON string
  let resourcesList: string[] = [];
  if (data.resourcesUsed) {
    try {
      if (typeof data.resourcesUsed === 'string') {
        const parsed = JSON.parse(data.resourcesUsed);
        resourcesList = Array.isArray(parsed) ? parsed : [data.resourcesUsed];
      } else if (Array.isArray(data.resourcesUsed)) {
        resourcesList = data.resourcesUsed;
      } else {
        resourcesList = [String(data.resourcesUsed)];
      }
    } catch {
      resourcesList = [String(data.resourcesUsed)];
    }
  }

  // Parse actions taken if it's a JSON string or array
  let actionsList: string[] = [];
  if (data.actionsTaken) {
    try {
      if (typeof data.actionsTaken === 'string') {
        const parsed = JSON.parse(data.actionsTaken);
        actionsList = Array.isArray(parsed) ? parsed : [data.actionsTaken];
      } else if (Array.isArray(data.actionsTaken)) {
        actionsList = data.actionsTaken;
      } else {
        actionsList = [String(data.actionsTaken)];
      }
    } catch {
      actionsList = data.actionsTaken.split('\n').filter(a => a.trim());
    }
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rescue Operation Report</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          background: white;
          color: #000;
        }
        
        .page {
          max-width: 800px;
          margin: 0 auto;
          page-break-after: always;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #3B82F6;
        }
        
        .header h1 {
          font-size: 24px;
          color: #1F2937;
          margin-bottom: 10px;
          font-weight: bold;
        }
        
        .header p {
          font-size: 12px;
          color: #6B7280;
          line-height: 1.6;
        }
        
        .section {
          margin-bottom: 25px;
        }
        
        .section-header {
          background: #3B82F6;
          color: white;
          padding: 10px 15px;
          font-size: 14px;
          font-weight: bold;
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .section-header-icon {
          width: 20px;
          height: 20px;
          margin-right: 10px;
          background: white;
          border-radius: 3px;
          display: inline-block;
        }
        
        .info-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        
        .info-table td {
          padding: 10px;
          border: 1px solid #E5E7EB;
          font-size: 11px;
        }
        
        .info-table td:first-child {
          background: #F3F4F6;
          font-weight: bold;
          width: 35%;
          color: #374151;
        }
        
        .info-table td:last-child {
          background: white;
          color: #1F2937;
        }
        
        .list-item {
          padding: 8px 12px;
          background: #F9FAFB;
          border-left: 3px solid #3B82F6;
          margin-bottom: 8px;
          font-size: 11px;
          color: #1F2937;
        }
        
        .two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 25px;
        }
        
        .completion-details {
          background: #EFF6FF;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
        }
        
        .completion-details h3 {
          color: #1E40AF;
          font-size: 14px;
          margin-bottom: 10px;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #DBEAFE;
          font-size: 11px;
        }
        
        .detail-row:last-child {
          border-bottom: none;
        }
        
        .detail-row .label {
          font-weight: bold;
          color: #1E40AF;
        }
        
        .detail-row .value {
          color: #1F2937;
        }
        
        .page-number {
          text-align: center;
          margin-top: 30px;
          font-size: 10px;
          color: #6B7280;
        }

        .emergency-badge {
          display: inline-block;
          background: #FEE2E2;
          color: #991B1B;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .critical { background: #FEE2E2; color: #991B1B; }
      </style>
    </head>
    <body>
      <!-- Page 1 -->
      <div class="page">
        <div class="header">
          <h1>Rescue Operation Report</h1>
          <p>This document serves as the official report of the rescue operation conducted for the affected community. 
          It records the key information, emergency context, and actions taken to ensure accountability, 
          transparency, and reference for future disaster response efforts.</p>
        </div>

        <!-- Community & Terminal Information -->
        <div class="section">
          <div class="section-header">
            <span class="section-header-icon"></span>
            Community & Terminal Information
          </div>
          <table class="info-table">
            <tr>
              <td>Neighborhood ID</td>
              <td>${data.neighborhoodId || 'N/A'}</td>
            </tr>
            <tr>
              <td>Focal Person's Name</td>
              <td>${data.focalFirstName} ${data.focalLastName}</td>
            </tr>
            <tr>
              <td>Focal Person's Address</td>
              <td>${data.focalAddress || 'N/A'}</td>
            </tr>
            <tr>
              <td>Focal Person's Contact Number</td>
              <td>${data.focalContactNumber || 'N/A'}</td>
            </tr>
          </table>
        </div>

        <!-- Emergency Context -->
        <div class="section">
          <div class="section-header">
            <span class="section-header-icon"></span>
            Emergency Context
          </div>
          <table class="info-table">
            <tr>
              <td>Emergency ID</td>
              <td><span class="emergency-badge">${data.emergencyId || 'N/A'}</span></td>
            </tr>
            <tr>
              <td>Current Situation / Water Level</td>
              <td>${data.waterLevel || 'N/A'}</td>
            </tr>
            <tr>
              <td>Urgency of Evacuation</td>
              <td>${data.urgencyOfEvacuation || 'N/A'}</td>
            </tr>
            <tr>
              <td>Hazards Present</td>
              <td>${data.hazardPresent || 'N/A'}</td>
            </tr>
            <tr>
              <td>Accessibility</td>
              <td>${data.accessibility || 'N/A'}</td>
            </tr>
            <tr>
              <td>Resource Needs</td>
              <td>${data.resourceNeeds || 'N/A'}</td>
            </tr>
            <tr>
              <td>Other Information</td>
              <td>${data.otherInformation || 'N/A'}</td>
            </tr>
            <tr>
              <td>Time of Re-Cht</td>
              <td>${formatDate(data.dateTimeOccurred)} ${formatTime(data.dateTimeOccurred)}</td>
            </tr>
            <tr>
              <td>Alert Type</td>
              <td>${data.alertType || 'Critical'}</td>
            </tr>
          </table>
        </div>

        <div class="page-number">Page | 1</div>
      </div>

      <!-- Page 2 -->
      <div class="page">
        <div class="header">
          <h1>Rescue Operation Report</h1>
          <p>Rescue Completion Details</p>
        </div>

        <!-- Rescue Completion Details -->
        <div class="completion-details">
          <h3>Rescue Completion Time</h3>
          <div class="detail-row">
            <span class="label">Completion Time</span>
            <span class="value">${formatTime(data.completionDate)}</span>
          </div>
          <div class="detail-row">
            <span class="label">No. of Personnel Deployed</span>
            <span class="value">${data.noOfPersonnel || 'N/A'}</span>
          </div>
          ${actionsList.length > 0 ? `
          <div class="detail-row">
            <span class="label">Actions Taken</span>
            <span class="value">${actionsList.join(', ')}</span>
          </div>
          ` : ''}
        </div>

        <div class="page-number">Page | 2</div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate a PDF from report data
 * @param reportData The detailed report data
 * @returns URI of the generated PDF file
 */
export const generateReportPDF = async (reportData: DetailedReportData): Promise<string> => {
  try {
    console.log('📄 Generating PDF for report:', reportData.emergencyId);
    
    const html = generateReportHTML(reportData);
    
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });
    
    console.log('✅ PDF generated successfully:', uri);
    return uri;
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

/**
 * Generate and share a PDF report
 * @param reportData The detailed report data
 */
export const generateAndSharePDF = async (reportData: DetailedReportData): Promise<void> => {
  try {
    const uri = await generateReportPDF(reportData);
    
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Rescue Report',
        UTI: 'com.adobe.pdf',
      });
    } else {
      console.warn('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('❌ Error sharing PDF:', error);
    throw error;
  }
};

/**
 * Generate and save a PDF report to device
 * @param reportData The detailed report data
 * @param filename Optional custom filename
 */
export const saveReportPDF = async (
  reportData: DetailedReportData,
  filename?: string
): Promise<string> => {
  try {
    const uri = await generateReportPDF(reportData);
    
    // Create a custom filename if not provided
    const pdfFilename = filename || `rescue_report_${reportData.emergencyId}_${Date.now()}.pdf`;
    const destinationUri = `${FileSystem.documentDirectory}${pdfFilename}`;
    
    // Move the file to a permanent location
    await FileSystem.moveAsync({
      from: uri,
      to: destinationUri,
    });
    
    console.log('✅ PDF saved to:', destinationUri);
    return destinationUri;
  } catch (error) {
    console.error('❌ Error saving PDF:', error);
    throw error;
  }
};
