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
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return 'N/A';
  }
};

/**
 * Format completion time as stopwatch format (HH:MM:SS.MS)
 * Currently inactive - displays placeholder format
 * Example: "00:00:00.00"
 */
const formatCompletionTime = (dateString: string | null): string => {
  // Placeholder stopwatch format (inactive)
  return '00:00:00.00';
};

/**
 * Format date and time in the required format: "Month Day, Year; H:MM (AM/PM); DayOfWeek"
 * Example: "January 9, 2026; 3:45 AM; Thursday"
 */
const formatDateTimeWithDay = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    const dateFormatted = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const dayOfWeek = date.toLocaleDateString('en-US', {
      weekday: 'long',
    });
    return `${dateFormatted}; ${time}; ${dayOfWeek}`;
  } catch {
    return dateString;
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
        
        @page {
          margin: 40px;
          size: A4;
        }
        
        body {
          font-family: Arial, sans-serif;
          background: white;
          color: #000;
        }
        
        .page {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          page-break-after: always;
          position: relative;
          min-height: 900px;
        }
        
        .page:last-child {
          page-break-after: avoid;
        }
        
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #1E40AF;
        }
        
        .header h1 {
          font-size: 16px;
          color: #1E40AF;
          margin-bottom: 5px;
          font-weight: bold;
        }
        
        .header p {
          font-size: 8px;
          color: #64748B;
          line-height: 1.3;
          max-width: 95%;
          margin: 0 auto;
        }
        
        .section {
          margin-bottom: 15px;
        }
        
        .section-title {
          font-size: 10px;
          color: #1E40AF;
          font-weight: bold;
          margin-bottom: 6px;
        }
        
        .info-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          border: 1px solid #1E40AF;
        }
        
        .info-table thead tr {
          background: #1E40AF;
        }
        
        .info-table thead th {
          color: white;
          font-weight: bold;
          padding: 8px 10px;
          font-size: 10px;
          text-align: left;
          border: 1px solid #1E40AF;
        }
        
        .info-table thead th:first-child {
          width: 40%;
        }
        
        .info-table tbody td {
          padding: 7px 10px;
          border: 1px solid #94A3B8;
          font-size: 9px;
          vertical-align: top;
        }
        
        .info-table tbody td:first-child {
          color: #1E40AF;
          font-weight: bold;
          width: 40%;
          background: white;
        }
        
        .info-table tbody td:last-child {
          background: white;
          color: #1F2937;
          word-wrap: break-word;
        }
        
        .completion-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #1E40AF;
        }
        
        .completion-table thead tr {
          background: #1E40AF;
        }
        
        .completion-table thead th {
          color: white;
          font-weight: bold;
          padding: 8px 10px;
          font-size: 10px;
          text-align: left;
          border: 1px solid #1E40AF;
        }
        
        .completion-table thead th:first-child {
          width: 40%;
        }
        
        .completion-table tbody td {
          padding: 7px 10px;
          border: 1px solid #94A3B8;
          font-size: 9px;
          vertical-align: top;
        }
        
        .completion-table tbody td:first-child {
          color: #1E40AF;
          font-weight: bold;
          width: 40%;
          background: white;
        }
        
        .completion-table tbody td:last-child {
          background: white;
          color: #1F2937;
        }
        
        .resource-list {
          margin: 0;
          padding: 0;
          list-style: none;
        }
        
        .resource-list li {
          padding: 3px 0;
          font-size: 9px;
          color: #1F2937;
        }
        
        .page-number {
          position: absolute;
          bottom: 30px;
          right: 40px;
          font-size: 9px;
          color: #64748B;
        }

        .emergency-badge {
          display: inline-block;
          background: #FEE2E2;
          color: #991B1B;
          padding: 3px 10px;
          border-radius: 10px;
          font-size: 9px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <!-- Page 1 -->
      <div class="page">
        <div class="header">
          <h1>Rescue Operation Report</h1>
          <p>This document serves as the official report of the rescue operation conducted for the affected community. It records the key information, emergency context, and actions taken to ensure accountability, transparency, and reference for future disaster response efforts.</p>
        </div>

        <!-- Community & Terminal Information -->
        <div class="section">
          <div class="section-title">Community & Terminal Information</div>
          <table class="info-table">
            <thead>
              <tr>
                <th>Neighborhood ID</th>
                <th>${data.neighborhoodId || 'N/A'}</th>
              </tr>
            </thead>
            <tbody>
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
            </tbody>
          </table>
        </div>

        <!-- Emergency Context -->
        <div class="section">
          <div class="section-title">Emergency Context</div>
          <table class="info-table">
            <thead>
              <tr>
                <th>Emergency ID</th>
                <th>${data.emergencyId || 'N/A'}</th>
              </tr>
            </thead>
            <tbody>
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
                <td>Time of Rescue</td>
                <td>${formatDateTimeWithDay(data.dateTimeOccurred)}</td>
              </tr>
              <tr>
                <td>Alert Type</td>
                <td>${data.alertType || 'Critical'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Rescue Completion Details -->
        <div class="section">
          <div class="section-title">Rescue Completion Details</div>
          <table class="completion-table">
            <thead>
              <tr>
                <th>Rescue Completion Time</th>
                <th>${formatCompletionTime(data.completionDate)}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>No. of Personnel Deployed</td>
                <td>${data.noOfPersonnel || 'N/A'}</td>
              </tr>
              <tr>
                <td>Resources Used</td>
                <td>
                  ${resourcesList.length > 0 ? `
                    <ul class="resource-list">
                      ${resourcesList.map(resource => `<li>${resource}</li>`).join('')}
                    </ul>
                  ` : 'N/A'}
                </td>
              </tr>
              <tr>
                <td>Actions Taken</td>
                <td>
                  ${actionsList.length > 0 ? `
                    <ul class="resource-list">
                      ${actionsList.map(action => `<li>${action}</li>`).join('')}
                    </ul>
                  ` : 'N/A'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="page-number">Page | 1</div>
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
