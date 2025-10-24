import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { PatientFormComponent } from './patient-form';
import { PatientService } from '../../services/patient';
import { Patient, PatientCreate, PatientUpdate } from '../../models/patient';

describe('PatientFormComponent', () => {
  let component: PatientFormComponent;
  let fixture: ComponentFixture<PatientFormComponent>;
  let patientService: jasmine.SpyObj<PatientService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: any;

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

  beforeEach(async () => {
    const patientServiceSpy = jasmine.createSpyObj('PatientService', [
      'getPatientById',
      'createPatient',
      'updatePatient'
    ]);
    
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    
    const activatedRouteMock = {
      params: of({ id: '1' })
    };

    await TestBed.configureTestingModule({
      imports: [
        PatientFormComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: PatientService, useValue: patientServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientFormComponent);
    component = fixture.componentInstance;
    patientService = TestBed.inject(PatientService) as jasmine.SpyObj<PatientService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRoute = TestBed.inject(ActivatedRoute);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty values in create mode', () => {
      activatedRoute.params = of({});
      fixture.detectChanges();

      expect(component.patientForm).toBeDefined();
      expect(component.isEditMode).toBe(false);
      expect(component.patientForm.get('firstName')?.value).toBe('');
      expect(component.patientForm.get('lastName')?.value).toBe('');
      expect(component.patientForm.get('email')?.value).toBe('');
      expect(component.patientForm.get('phone')?.value).toBe('');
      expect(component.patientForm.get('birthDate')?.value).toBe('');
    });

    it('should load patient data in edit mode', fakeAsync(() => {
      patientService.getPatientById.and.returnValue(of(mockPatient));
      activatedRoute.params = of({ id: '1' });

      fixture.detectChanges();
      tick();

      expect(component.isEditMode).toBe(true);
      expect(component.patientId).toBe(1);
      expect(patientService.getPatientById).toHaveBeenCalledWith(1);
      expect(component.patientForm.get('firstName')?.value).toBe('Juan');
      expect(component.patientForm.get('email')?.value).toBe('juan@test.com');
    }));

    it('should format birth date correctly in edit mode', fakeAsync(() => {
      patientService.getPatientById.and.returnValue(of(mockPatient));
      activatedRoute.params = of({ id: '1' });

      fixture.detectChanges();
      tick();

      const birthDate = component.patientForm.get('birthDate')?.value;
      expect(birthDate).toBe('1990-01-15');
    }));

    it('should handle error when loading patient', fakeAsync(() => {
      const errorMessage = 'Patient not found';
      patientService.getPatientById.and.returnValue(
        throwError(() => new Error(errorMessage))
      );
      activatedRoute.params = of({ id: '999' });

      fixture.detectChanges();
      tick();

      expect(component.error).toBe(errorMessage);
      expect(component.loading).toBe(false);
    }));
  });

  describe('Form Validations', () => {
    beforeEach(() => {
      activatedRoute.params = of({});
      fixture.detectChanges();
    });

    describe('firstName validation', () => {
      it('should be invalid when empty', () => {
        const firstName = component.patientForm.get('firstName');
        firstName?.setValue('');
        
        expect(firstName?.hasError('required')).toBe(true);
        expect(component.hasError('firstName')).toBe(false); // No touched yet
        
        firstName?.markAsTouched();
        expect(component.hasError('firstName')).toBe(true);
      });

      it('should be invalid when less than 2 characters', () => {
        const firstName = component.patientForm.get('firstName');
        firstName?.setValue('J');
        firstName?.markAsTouched();
        
        expect(firstName?.hasError('minlength')).toBe(true);
      });

      it('should be invalid when more than 100 characters', () => {
        const firstName = component.patientForm.get('firstName');
        firstName?.setValue('A'.repeat(101));
        firstName?.markAsTouched();
        
        expect(firstName?.hasError('maxlength')).toBe(true);
      });

      it('should be valid with proper length', () => {
        const firstName = component.patientForm.get('firstName');
        firstName?.setValue('Juan');
        
        expect(firstName?.valid).toBe(true);
      });
    });

    describe('email validation', () => {
      it('should be invalid when empty', () => {
        const email = component.patientForm.get('email');
        email?.setValue('');
        email?.markAsTouched();
        
        expect(email?.hasError('required')).toBe(true);
      });

      it('should be invalid with incorrect format', () => {
        const email = component.patientForm.get('email');
        email?.setValue('invalid-email');
        email?.markAsTouched();
        
        expect(email?.hasError('email')).toBe(true);
      });

      it('should be valid with correct format', () => {
        const email = component.patientForm.get('email');
        email?.setValue('test@example.com');
        
        expect(email?.valid).toBe(true);
      });

      it('should be invalid when exceeding max length', () => {
        const email = component.patientForm.get('email');
        const longEmail = 'a'.repeat(140) + '@test.com';
        email?.setValue(longEmail);
        
        expect(email?.hasError('maxlength')).toBe(true);
      });
    });

    describe('phone validation', () => {
      it('should be invalid when empty', () => {
        const phone = component.patientForm.get('phone');
        phone?.setValue('');
        phone?.markAsTouched();
        
        expect(phone?.hasError('required')).toBe(true);
      });

      it('should be invalid with less than 10 digits', () => {
        const phone = component.patientForm.get('phone');
        phone?.setValue('099999999');
        phone?.markAsTouched();
        
        expect(phone?.hasError('pattern')).toBe(true);
      });

      it('should be invalid with more than 10 digits', () => {
        const phone = component.patientForm.get('phone');
        phone?.setValue('09999999999');
        phone?.markAsTouched();
        
        expect(phone?.hasError('maxlength')).toBe(true);
      });

      it('should be invalid with non-numeric characters', () => {
        const phone = component.patientForm.get('phone');
        phone?.setValue('099999999a');
        phone?.markAsTouched();
        
        expect(phone?.hasError('pattern')).toBe(true);
      });

      it('should be valid with exactly 10 digits', () => {
        const phone = component.patientForm.get('phone');
        phone?.setValue('0999999999');
        
        expect(phone?.valid).toBe(true);
      });
    });

    describe('birthDate validation', () => {
      it('should be invalid when empty', () => {
        const birthDate = component.patientForm.get('birthDate');
        birthDate?.setValue('');
        birthDate?.markAsTouched();
        
        expect(birthDate?.hasError('required')).toBe(true);
      });

      it('should be invalid with future date', () => {
        const birthDate = component.patientForm.get('birthDate');
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);
        const futureDateString = futureDate.toISOString().split('T')[0];
        
        birthDate?.setValue(futureDateString);
        
        expect(birthDate?.hasError('futureDate')).toBe(true);
      });

      it('should be invalid with date before 1900', () => {
        const birthDate = component.patientForm.get('birthDate');
        birthDate?.setValue('1899-12-31');
        
        expect(birthDate?.hasError('tooOld')).toBe(true);
      });

      it('should be valid with proper date', () => {
        const birthDate = component.patientForm.get('birthDate');
        birthDate?.setValue('1990-01-15');
        
        expect(birthDate?.valid).toBe(true);
      });

      it('should be valid with today\'s date', () => {
        const birthDate = component.patientForm.get('birthDate');
        const today = new Date().toISOString().split('T')[0];
        birthDate?.setValue(today);
        
        expect(birthDate?.valid).toBe(true);
      });
    });
  });

  describe('Error Messages', () => {
    beforeEach(() => {
      activatedRoute.params = of({});
      fixture.detectChanges();
    });

    it('should return correct error message for required field', () => {
      const firstName = component.patientForm.get('firstName');
      firstName?.setValue('');
      firstName?.markAsTouched();
      
      const message = component.getErrorMessage('firstName');
      expect(message).toBe('Este campo es obligatorio');
    });

    it('should return correct error message for email format', () => {
      const email = component.patientForm.get('email');
      email?.setValue('invalid');
      email?.markAsTouched();
      
      const message = component.getErrorMessage('email');
      expect(message).toBe('Email inválido');
    });

    it('should return correct error message for phone pattern', () => {
      const phone = component.patientForm.get('phone');
      phone?.setValue('123');
      phone?.markAsTouched();
      
      const message = component.getErrorMessage('phone');
      expect(message).toBe('El teléfono debe tener exactamente 10 dígitos');
    });

    it('should return correct error message for future date', () => {
      const birthDate = component.patientForm.get('birthDate');
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      birthDate?.setValue(futureDate.toISOString().split('T')[0]);
      birthDate?.markAsTouched();
      
      const message = component.getErrorMessage('birthDate');
      expect(message).toBe('La fecha de nacimiento no puede ser futura');
    });
  });

  describe('Form Submission - Create Mode', () => {
    beforeEach(() => {
      activatedRoute.params = of({});
      fixture.detectChanges();
    });

    it('should not submit if form is invalid', () => {
      component.onSubmit();
      
      expect(component.submitted).toBe(true);
      expect(patientService.createPatient).not.toHaveBeenCalled();
    });

    it('should create patient with valid data', fakeAsync(() => {
      const newPatient: PatientCreate = {
        firstName: 'María',
        lastName: 'González',
        email: 'maria@test.com',
        phone: '0988888888',
        birthDate: '1995-05-20'
      };

      component.patientForm.patchValue(newPatient);
      patientService.createPatient.and.returnValue(of(mockPatient));

      component.onSubmit();
      tick();

      expect(patientService.createPatient).toHaveBeenCalledWith(newPatient);
      expect(router.navigate).toHaveBeenCalledWith(
        ['/patients'],
        { queryParams: { success: 'Paciente creado exitosamente' } }
      );
    }));

    it('should handle error when creating patient', fakeAsync(() => {
      const errorMessage = 'Email already exists';
      component.patientForm.patchValue({
        firstName: 'Test',
        lastName: 'User',
        email: 'existing@test.com',
        phone: '0999999999',
        birthDate: '1990-01-01'
      });

      patientService.createPatient.and.returnValue(
        throwError(() => new Error(errorMessage))
      );

      component.onSubmit();
      tick();

      expect(component.error).toBe(errorMessage);
      expect(component.loading).toBe(false);
      expect(router.navigate).not.toHaveBeenCalled();
    }));
  });

  describe('Form Submission - Edit Mode', () => {
    beforeEach(fakeAsync(() => {
      patientService.getPatientById.and.returnValue(of(mockPatient));
      activatedRoute.params = of({ id: '1' });
      fixture.detectChanges();
      tick();
    }));

    it('should update patient with valid data', fakeAsync(() => {
      const updateData: PatientUpdate = {
        firstName: 'Juan Carlos',
        lastName: 'Pérez García',
        email: 'juancarlos@test.com',
        phone: '0999999998',
        birthDate: '1990-01-15'
      };

      component.patientForm.patchValue(updateData);
      patientService.updatePatient.and.returnValue(of(mockPatient));

      component.onSubmit();
      tick();

      expect(patientService.updatePatient).toHaveBeenCalledWith(1, updateData);
      expect(router.navigate).toHaveBeenCalledWith(
        ['/patients'],
        { queryParams: { success: 'Paciente actualizado exitosamente' } }
      );
    }));

    it('should handle error when updating patient', fakeAsync(() => {
      const errorMessage = 'Email already exists';
      
      patientService.updatePatient.and.returnValue(
        throwError(() => new Error(errorMessage))
      );

      component.onSubmit();
      tick();

      expect(component.error).toBe(errorMessage);
      expect(component.loading).toBe(false);
    }));
  });

  describe('Cancel Functionality', () => {
    it('should navigate back without confirmation if form is pristine', () => {
      component.cancel();
      
      expect(router.navigate).toHaveBeenCalledWith(['/patients']);
    });

    it('should ask for confirmation if form is dirty', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      component.patientForm.markAsDirty();
      
      component.cancel();
      
      expect(window.confirm).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/patients']);
    });

    it('should not navigate if user cancels confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      component.patientForm.markAsDirty();
      
      component.cancel();
      
      expect(window.confirm).toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Helper Methods', () => {
    beforeEach(() => {
      activatedRoute.params = of({});
      fixture.detectChanges();
    });

    it('should check if field has error', () => {
      const firstName = component.patientForm.get('firstName');
      firstName?.setValue('');
      firstName?.markAsTouched();
      
      expect(component.hasError('firstName')).toBe(true);
      expect(component.hasError('firstName', 'required')).toBe(true);
      expect(component.hasError('firstName', 'minlength')).toBe(false);
    });

    it('should return false for valid field', () => {
      const firstName = component.patientForm.get('firstName');
      firstName?.setValue('Juan');
      
      expect(component.hasError('firstName')).toBe(false);
    });

    it('should return today\'s date in correct format', () => {
      const today = component.getTodayDate();
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      
      expect(today).toMatch(dateRegex);
    });

    it('should reset form', () => {
      component.patientForm.patchValue({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        phone: '0999999999',
        birthDate: '1990-01-01'
      });
      component.submitted = true;
      component.error = 'Some error';
      
      component.resetForm();
      
      expect(component.submitted).toBe(false);
      expect(component.error).toBe('');
      expect(component.patientForm.get('firstName')?.value).toBe(null);
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

  describe('Loading States', () => {
    it('should show loading state when creating', fakeAsync(() => {
      activatedRoute.params = of({});
      fixture.detectChanges();
      
      component.patientForm.patchValue({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@test.com',
        phone: '0999999999',
        birthDate: '1990-01-01'
      });

      patientService.createPatient.and.returnValue(of(mockPatient));
      
      component.onSubmit();
      expect(component.loading).toBe(true);
      
      tick();
      expect(component.loading).toBe(false);
    }));

    it('should show loading state when loading patient', () => {
      patientService.getPatientById.and.returnValue(of(mockPatient));
      activatedRoute.params = of({ id: '1' });
      
      component.checkEditMode();
      
      expect(component.loading).toBe(true);
    });
  });

  describe('Form Control Access', () => {
    it('should provide access to form controls', () => {
      activatedRoute.params = of({});
      fixture.detectChanges();
      
      const controls = component.f;
      
      expect(controls['firstName']).toBeDefined();
      expect(controls['lastName']).toBeDefined();
      expect(controls['email']).toBeDefined();
      expect(controls['phone']).toBeDefined();
      expect(controls['birthDate']).toBeDefined();
    });
  });
});