import { apiFetch } from '@/lib/api-client';

// Types for the log data structure based on backend response
export interface LogField {
  field: string;
  oldValue: string | null;
  newValue: string | null;
}

export interface LogAction {
  time: string;
  actorName: string;
  entityType: string;
  message: string;
  createdAt: string;
  fields: LogField[];
}

export interface DailyLog {
  date: string;
  count: number;
  actions: LogAction[];
}

export interface LogsResponse {
  lastUpdated: string | null;
  days: DailyLog[];
  total: number;
}

class LogService {
  /**
   * Get the logged-in user's own logs
   */
  async getOwnLogs(): Promise<LogsResponse> {
    try {
      console.log('📊 [LogService] Fetching own logs from: /logs/own');
      console.log('📊 [LogService] Making API call...');
      
      const logs = await apiFetch<LogsResponse>('/logs/own');
      
      console.log('✅ [LogService] Own logs fetched successfully:', {
        total: logs.total,
        daysCount: logs.days.length,
        lastUpdated: logs.lastUpdated,
      });
      
      if (logs.days.length > 0) {
        console.log('📋 [LogService] Sample of first day:', {
          date: logs.days[0].date,
          count: logs.days[0].count,
          actionsCount: logs.days[0].actions.length,
        });
      } else {
        console.log('⚠️ [LogService] No days returned in response');
      }
      
      return logs;
    } catch (error: any) {
      console.error('❌ [LogService] Error fetching own logs:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      throw error;
    }
  }
}

export const logService = new LogService();
