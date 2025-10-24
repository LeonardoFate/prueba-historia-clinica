import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { PatientList } from './patient-list';
import { PatientService } from '../../services/patient';
import { Patient, PaginatedResponse } from '../../models/patient';

describe('PatientList', () => {
  let component: PatientList;
  let fixture: ComponentFixture<PatientList>;
  let patientService: jasmine.SpyObj<PatientService>;
  let router: jasmine.SpyObj<Router>;

  const mockPatients: Patient[] = [
    {
      ID: 1,
      FIRST_NAME: 'Juan',
      LAST_NAME: 'Pérez',
      EMAIL: 'juan@test.com',
      PHONE: '0999999999',
      BIRTH_DATE: '1990-01-15T00:00:00.000Z',
      CREATED_AT: '2024-01-01T00:00:00.000Z',
      UPDATED_AT: '2024-01-01T00:00:00.000Z'
    },
    {
      ID: 2,
      FIRST_NAME: 'María',
      LAST_NAME: 'González',
      EMAIL: 'maria@test.com',
      PHONE: '0988888888',
      BIRTH_DATE: '1995-05-20T00:00:00.000Z',
      CREATED_AT: '2024-01-02T00:00:00.000Z',
      UPDATED_AT: '2024-01-02T00:00:00.000Z'
    }
  ];

  const mockPaginatedResponse: PaginatedResponse = {
    patients: mockPatients,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalRecords: 2,
      limit: 10
    }
  };

  beforeEach(async () => {
    const patientServiceSpy = jasmine.createSpyObj('PatientService', [
      'getPatients',
      'deletePatient',
      'calculateAge',
      'formatDate'
    ]);
    
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        PatientList,
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule
      ],
      providers: [
        { provide: PatientService, useValue: patientServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientList);
    component = fixture.componentInstance;
    patientService = TestBed.inject(PatientService) as jasmine.SpyObj<PatientService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    // Setup default spy returns
    patientService.getPatients.and.returnValue(of(mockPaginatedResponse));
    patientService.calculateAge.and.returnValue(34);
    patientService.formatDate.and.returnValue('15/01/2024');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should load patients on init', () => {
      fixture.detectChanges();

      expect(patientService.getPatients).toHaveBeenCalledWith(1, 10, '');
      expect(component.patients).toEqual(mockPatients);
      expect(component.totalRecords).toBe(2);
      expect(component.loading).toBe(false);
    });

    it('should handle query params on init', fakeAsync(() => {
      const activatedRoute = TestBed.inject(Router as any);
      component.success = '';

      fixture.detectChanges();
      tick();

      expect(component.patients.length).toBe(2);
    }));

    it('should handle loading state', () => {
      component.loading = true;
      fixture.detectChanges();

      expect(component.loading).toBe(true);
      
      component.ngOnInit();
      expect(patientService.getPatients).toHaveBeenCalled();
    });
  });

  describe('loadPatients', () => {
    it('should load patients successfully', () => {
      component.loadPatients();

      expect(component.loading).toBe(false);
      expect(component.patients).toEqual(mockPatients);
      expect(component.totalRecords).toBe(2);
      expect(component.error).toBe('');
    });

    it('should handle error when loading patients', () => {
      const errorMessage = 'Error al cargar pacientes';
      patientService.getPatients.and.returnValue(
        throwError(() => new Error(errorMessage))
      );

      component.loadPatients();

      expect(component.loading).toBe(false);
      expect(component.error).toBe(errorMessage);
      expect(component.patients).toEqual([]);
    });

    it('should generate page numbers correctly', () => {
      const response: PaginatedResponse = {
        patients: mockPatients,
        pagination: {
          currentPage: 3,
          totalPages: 10,
          totalRecords: 100,
          limit: 10
        }
      };
      patientService.getPatients.and.returnValue(of(response));

      component.loadPatients();

      expect(component.pages.length).toBeGreaterThan(0);
      expect(component.pages.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      const response: PaginatedResponse = {
        patients: mockPatients,
        pagination: {
          currentPage: 5,
          totalPages: 10,
          totalRecords: 100,
          limit: 10
        }
      };
      patientService.getPatients.and.returnValue(of(response));
    });

    it('should go to specific page', () => {
      component.goToPage(3);

      expect(patientService.getPatients).toHaveBeenCalledWith(3, 10, '');
    });

    it('should not go to invalid page (< 1)', () => {
      component.currentPage = 5;
      const initialCallCount = patientService.getPatients.calls.count();

      component.goToPage(0);

      expect(patientService.getPatients.calls.count()).toBe(initialCallCount);
    });

    it('should not go to invalid page (> totalPages)', () => {
      component.loadPatients();
      const totalPages = component.totalPages;
      const initialCallCount = patientService.getPatients.calls.count();

      component.goToPage(totalPages + 1);

      expect(patientService.getPatients.calls.count()).toBe(initialCallCount);
    });

    it('should not go to same page', () => {
      component.currentPage = 5;
      component.loadPatients();
      const initialCallCount = patientService.getPatients.calls.count();

      component.goToPage(5);

      expect(patientService.getPatients.calls.count()).toBe(initialCallCount);
    });

    it('should go to previous page', () => {
      component.loadPatients();
      component.currentPage = 5;

      component.previousPage();

      expect(patientService.getPatients).toHaveBeenCalledWith(4, 10, '');
    });

    it('should not go to previous page if on first page', () => {
      component.loadPatients();
      component.currentPage = 1;
      const initialCallCount = patientService.getPatients.calls.count();

      component.previousPage();

      expect(patientService.getPatients.calls.count()).toBe(initialCallCount);
    });

    it('should go to next page', () => {
      component.loadPatients();
      component.currentPage = 5;

      component.nextPage();

      expect(patientService.getPatients).toHaveBeenCalledWith(6, 10, '');
    });

    it('should not go to next page if on last page', () => {
      component.loadPatients();
      component.currentPage = 10;
      const initialCallCount = patientService.getPatients.calls.count();

      component.nextPage();

      expect(patientService.getPatients.calls.count()).toBe(initialCallCount);
    });
  });

  describe('Search Functionality', () => {
    it('should trigger search with debounce', fakeAsync(() => {
      component.onSearchChange('Juan');
      
      tick(499); 
      expect(patientService.getPatients.calls.count()).toBe(0);
      
      tick(1); 
      expect(patientService.getPatients).toHaveBeenCalledWith(1, 10, 'Juan');
    }));

    it('should reset to page 1 when searching', fakeAsync(() => {
      component.currentPage = 5;
      component.onSearchChange('María');
      
      tick(500);
      
      expect(component.currentPage).toBe(1);
    }));

    it('should not trigger duplicate searches', fakeAsync(() => {
      component.onSearchChange('test');
      tick(250);
      component.onSearchChange('test');
      tick(500);
      
      expect(patientService.getPatients.calls.count()).toBe(1);
    }));

    it('should clear search term', fakeAsync(() => {
      component.searchTerm = 'Juan';
      component.onSearchChange('');
      
      tick(500);
      
      expect(patientService.getPatients).toHaveBeenCalledWith(1, 10, '');
    }));
  });

  describe('CRUD Operations', () => {
    it('should navigate to create patient', () => {
      component.createPatient();
      
      expect(router.navigate).toHaveBeenCalledWith(['/patients/new']);
    });

    it('should navigate to edit patient', () => {
      component.editPatient(1);
      
      expect(router.navigate).toHaveBeenCalledWith(['/patients/edit', 1]);
    });

    describe('deletePatient', () => {
      it('should delete patient after confirmation', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        patientService.deletePatient.and.returnValue(of(undefined));

        component.deletePatient(mockPatients[0]);

        expect(window.confirm).toHaveBeenCalled();
        expect(patientService.deletePatient).toHaveBeenCalledWith(1);
        expect(component.success).toContain('Juan Pérez');
      });

      it('should not delete patient if not confirmed', () => {
        spyOn(window, 'confirm').and.returnValue(false);

        component.deletePatient(mockPatients[0]);

        expect(window.confirm).toHaveBeenCalled();
        expect(patientService.deletePatient).not.toHaveBeenCalled();
      });

      it('should handle delete error', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        const errorMessage = 'Error al eliminar';
        patientService.deletePatient.and.returnValue(
          throwError(() => new Error(errorMessage))
        );

        component.deletePatient(mockPatients[0]);

        expect(component.error).toBe(errorMessage);
        expect(component.loading).toBe(false);
      });

      it('should reload patients after successful delete', () => {
        spyOn(window, 'confirm').and.returnValue(true);
        patientService.deletePatient.and.returnValue(of(undefined));
        const loadSpy = spyOn(component, 'loadPatients');

        component.deletePatient(mockPatients[0]);

        expect(loadSpy).toHaveBeenCalled();
      });
    });
  });

  describe('Helper Methods', () => {
    it('should get full name', () => {
      const fullName = component.getFullName(mockPatients[0]);
      
      expect(fullName).toBe('Juan Pérez');
    });

    it('should get age', () => {
      const age = component.getAge('1990-01-15T00:00:00.000Z');
      
      expect(patientService.calculateAge).toHaveBeenCalledWith('1990-01-15T00:00:00.000Z');
      expect(age).toBe(34);
    });

    it('should format date', () => {
      const formatted = component.formatDate('2024-01-15T00:00:00.000Z');
      
      expect(patientService.formatDate).toHaveBeenCalledWith('2024-01-15T00:00:00.000Z');
      expect(formatted).toBe('15/01/2024');
    });

    it('should clear messages', () => {
      component.success = 'Success message';
      component.error = 'Error message';
      
      component.clearMessages();
      
      expect(component.success).toBe('');
      expect(component.error).toBe('');
    });
  });

  describe('Page Number Generation', () => {
    it('should generate correct page numbers for start', () => {
      const response: PaginatedResponse = {
        patients: mockPatients,
        pagination: {
          currentPage: 2,
          totalPages: 10,
          totalRecords: 100,
          limit: 10
        }
      };
      patientService.getPatients.and.returnValue(of(response));

      component.loadPatients();

      expect(component.pages).toContain(1);
      expect(component.pages).toContain(2);
    });

    it('should generate correct page numbers for middle', () => {
      const response: PaginatedResponse = {
        patients: mockPatients,
        pagination: {
          currentPage: 5,
          totalPages: 10,
          totalRecords: 100,
          limit: 10
        }
      };
      patientService.getPatients.and.returnValue(of(response));

      component.loadPatients();

      expect(component.pages).toContain(5);
    });

    it('should generate correct page numbers for end', () => {
      const response: PaginatedResponse = {
        patients: mockPatients,
        pagination: {
          currentPage: 9,
          totalPages: 10,
          totalRecords: 100,
          limit: 10
        }
      };
      patientService.getPatients.and.returnValue(of(response));

      component.loadPatients();

      expect(component.pages).toContain(9);
      expect(component.pages).toContain(10);
    });
  });

  describe('Component Cleanup', () => {
    it('should complete destroy$ subject on destroy', () => {
      const destroySpy = spyOn(component['destroy$'], 'next');
      const completeSpy = spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });

  describe('Empty States', () => {
    it('should display empty state when no patients', () => {
      const emptyResponse: PaginatedResponse = {
        patients: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalRecords: 0,
          limit: 10
        }
      };
      patientService.getPatients.and.returnValue(of(emptyResponse));

      component.loadPatients();

      expect(component.patients.length).toBe(0);
      expect(component.totalRecords).toBe(0);
    });

    it('should display no results for search', () => {
      const emptyResponse: PaginatedResponse = {
        patients: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalRecords: 0,
          limit: 10
        }
      };
      patientService.getPatients.and.returnValue(of(emptyResponse));

      component.searchTerm = 'NonExistent';
      component.loadPatients();

      expect(component.patients.length).toBe(0);
    });
  });
});