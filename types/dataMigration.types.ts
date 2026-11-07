/**
 * كائنات وأنواع ترحيل البيانات القديمة (Data Migration Types)
 * مدرسة نبراس القرآنية — مسجد إبراهيم الخليل
 * المرحلة 11: ترحيل البيانات القديمة و LocalStorage
 */

export interface ValidationIssue {
  entityType: string;
  recordId: string;
  field: string;
  message: string;
  severity: 'warning' | 'error';
}

export interface MigrationPreflightReport {
  totalRecordsFound: number;
  entitiesBreakdown: Record<string, number>;
  issues: ValidationIssue[];
  isValid: boolean;
}

export interface EntityMigrationResult {
  entityType: string;
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export interface MigrationExecutionReport {
  id: string;
  startedAt: string;
  completedAt: string;
  executedBy: string;
  isSuccessful: boolean;
  results: Record<string, EntityMigrationResult>;
  totalMigrated: number;
  totalFailed: number;
  auditLogId?: string;
  notes?: string;
}

export interface LegacyDatabaseDump {
  nebras_students?: any[];
  nebras_teachers?: any[];
  nebras_halls?: any[];
  nebras_circles?: any[];
  nebras_attendance_logs?: any[];
  nebras_fees?: any[];
  nebras_grades?: any[];
  nebras_announcements?: any[];
  nebras_settings?: any;
  [key: string]: any;
}
