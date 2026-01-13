import { apiFetch } from '@/lib/api-client';

// Types for the report data structure based on backend response
export interface ReportData {
  neighborhoodId: string;
  focalFirstName: string;
  focalLastName: string;
  focalAddress: string;
  focalContactNumber: string;
  emergencyId: string;
  alertId: string;
  dateTimeOccurred: string;
  waterLevel: string | null;
  urgencyOfEvacuation: string | null;
  hazardPresent: string | null;
  accessibility: string | null;
  resourceNeeds: string | null;
  otherInformation: string | null;
  alertType: string;
  timeOfRescue: string | null;
  completionDate: string | null;
  noOfPersonnel: number | null;
  resourcesUsed: any; // Can be array or object
  actionsTaken: string | null;
}

export interface CompletedReport {
  alertId: string;
  terminalName: string;
  alertType: string;
  dispatcherName: string;
  rescueStatus: string;
  createdAt: string;
  completedAt: string;
  address: string;
}

export interface PendingReport {
  alertId: string;
  terminalName: string;
  alertType: string;
  dispatcherName: string;
  rescueStatus: string;
  createdAt: string;
  address: string;
  neighborhoodId: string;
  focalFirstName: string;
  focalLastName: string;
  latitude?: number;
  longitude?: number;
}

class ReportService {
  /**
   * Get aggregated rescue reports with all details
   * @param alertId Optional - specific alert ID to fetch, if not provided returns all reports
   * @param bypassCache Optional - force fresh data from database
   */
  async getAggregatedReports(alertId?: string, bypassCache?: boolean): Promise<ReportData[]> {
    try {
      let endpoint = alertId 
        ? `/post/aggregated?alertID=${alertId}`
        : '/post/aggregated';
      
      // Add cache bypass parameter if requested
      if (bypassCache) {
        endpoint += alertId ? '&refresh=true' : '?refresh=true';
      }
      
      console.log('📊 Fetching aggregated reports from:', endpoint);
      const reports = await apiFetch<ReportData[]>(endpoint);
      console.log('✅ Aggregated reports fetched:', reports.length);
      return reports;
    } catch (error) {
      console.error('❌ Error fetching aggregated reports:', error);
      throw error;
    }
  }

  /**
   * Get completed reports (reports with PostRescueForm)
   */
  async getCompletedReports(): Promise<CompletedReport[]> {
    try {
      console.log('📊 Fetching completed reports');
      const reports = await apiFetch<CompletedReport[]>('/post/completed');
      console.log('✅ Completed reports fetched:', reports.length);
      return reports;
    } catch (error) {
      console.error('❌ Error fetching completed reports:', error);
      throw error;
    }
  }

  /**
   * Get pending reports (reports without PostRescueForm)
   */
  async getPendingReports(): Promise<PendingReport[]> {
    try {
      console.log('📊 Fetching pending reports');
      const reports = await apiFetch<PendingReport[]>('/post/pending');
      console.log('✅ Pending reports fetched:', reports.length);
      return reports;
    } catch (error) {
      console.error('❌ Error fetching pending reports:', error);
      throw error;
    }
  }

  /**
   * Get detailed report data for PDF generation
   * @param alertId The alert ID to fetch detailed data for
   */
  async getDetailedReportData(alertId: string): Promise<any> {
    try {
      console.log('📊 Fetching detailed report for:', alertId);
      const report = await apiFetch(`/post/report/${alertId}`);
      console.log('✅ Detailed report fetched');
      return report;
    } catch (error) {
      console.error('❌ Error fetching detailed report:', error);
      throw error;
    }
  }
}

export const reportService = new ReportService();
