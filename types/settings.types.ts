export interface SchoolSettings {
  id: number;
  schoolName: string;
  affiliation: string;
  defaultCurrency: string;
  timezone: string;
  language: string;
  direction: string;
  vision: string | null;
  message: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  updatedAt?: string;
}

export interface AcademicYearItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  createdAt?: string;
}

export interface CreateAcademicYearDTO {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}

export interface AuditLogItem {
  id: string;
  userId: string | null;
  userEmail: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string | null;
  oldData: any | null;
  newData: any | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface AuditFilterParams {
  search?: string;
  action?: string;
  entityType?: string;
  userRole?: string;
  limit?: number;
}
