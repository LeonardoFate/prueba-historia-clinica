export interface Patient {
  ID: number;
  FIRST_NAME: string;
  LAST_NAME: string;
  EMAIL: string;
  PHONE: string;
  BIRTH_DATE: string;
  CREATED_AT: string;
  UPDATED_AT: string;
}

export interface PatientCreate {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
}

export interface PatientUpdate extends PatientCreate {}

export interface PaginatedResponse {
  patients: Patient[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    limit: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}