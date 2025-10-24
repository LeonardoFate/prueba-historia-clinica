import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PatientService } from './patient';
import { Patient, PatientCreate, PatientUpdate, PaginatedResponse, ApiResponse } from '../models/patient';

describe('PatientService', () => {
  let service: PatientService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:3000/api/patients';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PatientService]
    });
    
    service = TestBed.inject(PatientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); 
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getPatients', () => {
    it('should return paginated patients', () => {
      const mockResponse: ApiResponse<PaginatedResponse> = {
        success: true,
        message: 'Pacientes obtenidos exitosamente',
        data: {
          patients: [
            {
              ID: 1,
              FIRST_NAME: 'Juan',
              LAST_NAME: 'Pérez',
              EMAIL: 'juan@test.com',
              PHONE: '0999999999',
              BIRTH_DATE: '1990-01-15T00:00:00.000Z',
              CREATED_AT: '2024-01-01T00:00:00.000Z',
              UPDATED_AT: '2024-01-01T00:00:00.000Z'
            }
          ],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalRecords: 1,
            limit: 10
          }
        }
      };

      service.getPatients(1, 10, '').subscribe(response => {
        expect(response).toEqual(mockResponse.data);
        expect(response.patients.length).toBe(1);
        expect(response.pagination.currentPage).toBe(1);
      });

      const req = httpMock.expectOne(`${apiUrl}?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should include search parameter when provided', () => {
      const mockResponse: ApiResponse<PaginatedResponse> = {
        success: true,
        message: 'Pacientes encontrados',
        data: {
          patients: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalRecords: 0,
            limit: 10
          }
        }
      };

      service.getPatients(1, 10, 'Juan').subscribe();

      const req = httpMock.expectOne(`${apiUrl}?page=1&limit=10&search=Juan`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle empty search term', () => {
      const mockResponse: ApiResponse<PaginatedResponse> = {
        success: true,
        message: 'Pacientes obtenidos',
        data: {
          patients: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalRecords: 0,
            limit: 10
          }
        }
      };

      service.getPatients(1, 10, '   ').subscribe();

      const req = httpMock.expectOne(`${apiUrl}?page=1&limit=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle HTTP errors', () => {
      const errorMessage = 'Error del servidor';

      service.getPatients(1, 10, '').subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe(errorMessage);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}?page=1&limit=10`);
      req.flush({ message: errorMessage }, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getPatientById', () => {
    it('should return a patient by ID', () => {
      const mockPatient: Patient = {
        ID: 1,
        FIRST_NAME: 'Juan',
        LAST_NAME: 'Pérez',
        EMAIL: 'juan@test.com',
        PHONE: '0999999999',
        BIRTH_DATE: '1990-01-15T00:00:00.000Z',
        CREATED_AT: '2024-01-01T00:00:00.000Z',
        UPDATED_AT: '2024-01-01T00:00:00.000Z'
      };

      const mockResponse: ApiResponse<Patient> = {
        success: true,
        message: 'Paciente obtenido',
        data: mockPatient
      };

      service.getPatientById(1).subscribe(patient => {
        expect(patient).toEqual(mockPatient);
        expect(patient.FIRST_NAME).toBe('Juan');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle 404 error', () => {
      service.getPatientById(999).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toContain('no encontrado');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/999`);
      req.flush({ message: 'Recurso no encontrado' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('createPatient', () => {
    it('should create a new patient', () => {
      const newPatient: PatientCreate = {
        firstName: 'María',
        lastName: 'González',
        email: 'maria@test.com',
        phone: '0988888888',
        birthDate: '1995-05-20'
      };

      const createdPatient: Patient = {
        ID: 2,
        FIRST_NAME: 'María',
        LAST_NAME: 'González',
        EMAIL: 'maria@test.com',
        PHONE: '0988888888',
        BIRTH_DATE: '1995-05-20T00:00:00.000Z',
        CREATED_AT: '2024-01-01T00:00:00.000Z',
        UPDATED_AT: '2024-01-01T00:00:00.000Z'
      };

      const mockResponse: ApiResponse<Patient> = {
        success: true,
        message: 'Paciente creado',
        data: createdPatient
      };

      service.createPatient(newPatient).subscribe(patient => {
        expect(patient).toEqual(createdPatient);
        expect(patient.ID).toBe(2);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newPatient);
      req.flush(mockResponse);
    });

    it('should handle duplicate email error', () => {
      const newPatient: PatientCreate = {
        firstName: 'Test',
        lastName: 'User',
        email: 'existing@test.com',
        phone: '0999999999',
        birthDate: '1990-01-01'
      };

      service.createPatient(newPatient).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('El email ya está registrado');
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush({ message: 'Email already exists' }, { status: 409, statusText: 'Conflict' });
    });
  });

  describe('updatePatient', () => {
    it('should update an existing patient', () => {
      const updateData: PatientUpdate = {
        firstName: 'Juan Carlos',
        lastName: 'Pérez García',
        email: 'juancarlos@test.com',
        phone: '0999999998',
        birthDate: '1990-01-15'
      };

      const updatedPatient: Patient = {
        ID: 1,
        FIRST_NAME: 'Juan Carlos',
        LAST_NAME: 'Pérez García',
        EMAIL: 'juancarlos@test.com',
        PHONE: '0999999998',
        BIRTH_DATE: '1990-01-15T00:00:00.000Z',
        CREATED_AT: '2024-01-01T00:00:00.000Z',
        UPDATED_AT: '2024-01-02T00:00:00.000Z'
      };

      const mockResponse: ApiResponse<Patient> = {
        success: true,
        message: 'Paciente actualizado',
        data: updatedPatient
      };

      service.updatePatient(1, updateData).subscribe(patient => {
        expect(patient).toEqual(updatedPatient);
        expect(patient.FIRST_NAME).toBe('Juan Carlos');
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updateData);
      req.flush(mockResponse);
    });

    it('should handle 404 when patient does not exist', () => {
      const updateData: PatientUpdate = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        phone: '0999999999',
        birthDate: '1990-01-01'
      };

      service.updatePatient(999, updateData).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toContain('no encontrado');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/999`);
      req.flush({ message: 'Patient not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('deletePatient', () => {
    it('should delete a patient', () => {
      const mockResponse: ApiResponse<null> = {
        success: true,
        message: 'Paciente eliminado',
        data: null
      };

      service.deletePatient(1).subscribe(result => {
        expect(result).toBeUndefined();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });

    it('should handle 404 when patient does not exist', () => {
      service.deletePatient(999).subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toContain('no encontrado');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/999`);
      req.flush({ message: 'Patient not found' }, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('Helper Methods', () => {
    describe('calculateAge', () => {
      it('should calculate age correctly', () => {
        const birthDate = '1990-01-15T00:00:00.000Z';
        const age = service.calculateAge(birthDate);
        
        const today = new Date();
        const expectedAge = today.getFullYear() - 1990;
        
        expect(age).toBeGreaterThanOrEqual(expectedAge - 1);
        expect(age).toBeLessThanOrEqual(expectedAge);
      });

      it('should handle birthday not yet occurred this year', () => {
        const today = new Date();
        const futureMonth = today.getMonth() + 2;
        const birthDate = new Date(1990, futureMonth, 15).toISOString();
        
        const age = service.calculateAge(birthDate);
        expect(age).toBeGreaterThanOrEqual(33);
      });
    });

    describe('formatDate', () => {
      it('should format date correctly', () => {
        const date = '2024-01-15T10:30:00.000Z';
        const formatted = service.formatDate(date);
        
        expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      });

      it('should handle different date formats', () => {
        const date = '1990-12-31';
        const formatted = service.formatDate(date);
        
        expect(formatted).toBeTruthy();
        expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network error (status 0)', () => {
      service.getPatients().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('No se pudo conectar con el servidor');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}?page=1&limit=10`);
      req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
    });

    it('should handle 500 internal server error', () => {
      service.getPatients().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe('Error interno del servidor');
        }
      });

      const req = httpMock.expectOne(`${apiUrl}?page=1&limit=10`);
      req.flush({}, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should use error message from response when available', () => {
      const customError = 'Error personalizado del servidor';

      service.getPatients().subscribe({
        next: () => fail('should have failed'),
        error: (error) => {
          expect(error.message).toBe(customError);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}?page=1&limit=10`);
      req.flush({ message: customError }, { status: 400, statusText: 'Bad Request' });
    });
  });
});