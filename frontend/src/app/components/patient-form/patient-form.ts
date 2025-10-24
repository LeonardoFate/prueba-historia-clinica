import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PatientService } from '../../services/patient';
import { Patient, PatientCreate, PatientUpdate } from '../../models/patient';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './patient-form.html',
  styleUrls: ['./patient-form.css']
})
export class PatientFormComponent implements OnInit, OnDestroy {
  patientForm!: FormGroup;
  isEditMode: boolean = false;
  patientId: number | null = null;
  loading: boolean = false;
  submitted: boolean = false;
  error: string = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Inicializar formulario con validaciones
   */
  initForm(): void {
    this.patientForm = this.formBuilder.group({
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.maxLength(150)
      ]],
      phone: ['', [
        Validators.required,
        Validators.pattern(/^\d{10}$/),
        Validators.minLength(10),
        Validators.maxLength(10)
      ]],
      birthDate: ['', [
        Validators.required,
        this.dateNotFutureValidator
      ]]
    });
  }

  /**
   * Validador personalizado: fecha no puede ser futura
   */
  dateNotFutureValidator(control: any) {
    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate > today) {
      return { futureDate: true };
    }

    // Validar que no sea menor a 1900
    const minDate = new Date('1900-01-01');
    if (selectedDate < minDate) {
      return { tooOld: true };
    }

    return null;
  }

  /**
   * Verificar si estamos en modo edición
   */
  checkEditMode(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['id']) {
          this.isEditMode = true;
          this.patientId = +params['id'];
          this.loadPatient(this.patientId);
        }
      });
  }

  /**
   * Cargar datos del paciente para editar
   */
  loadPatient(id: number): void {
    this.loading = true;
    this.error = '';

    this.patientService
      .getPatientById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (patient: Patient) => {
          // Formatear fecha para el input type="date"
          const birthDate = patient.BIRTH_DATE.split('T')[0];
          
          this.patientForm.patchValue({
            firstName: patient.FIRST_NAME,
            lastName: patient.LAST_NAME,
            email: patient.EMAIL,
            phone: patient.PHONE,
            birthDate: birthDate
          });
          
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  /**
   * Getters para facilitar acceso a los controles del formulario
   */
  get f() {
    return this.patientForm.controls;
  }

  /**
   * Verificar si un campo tiene error
   */
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.patientForm.get(fieldName);
    if (!field) return false;

    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched || this.submitted);
    }

    return field.invalid && (field.dirty || field.touched || this.submitted);
  }

  /**
   * Obtener mensaje de error para un campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.patientForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required']) {
      return 'Este campo es obligatorio';
    }

    if (fieldName === 'firstName' || fieldName === 'lastName') {
      if (errors['minlength']) {
        return 'Debe tener al menos 2 caracteres';
      }
      if (errors['maxlength']) {
        return 'No puede exceder 100 caracteres';
      }
    }

    if (fieldName === 'email') {
      if (errors['email']) {
        return 'Email inválido';
      }
      if (errors['maxlength']) {
        return 'No puede exceder 150 caracteres';
      }
    }

    if (fieldName === 'phone') {
      if (errors['pattern'] || errors['minlength'] || errors['maxlength']) {
        return 'El teléfono debe tener exactamente 10 dígitos';
      }
    }

    if (fieldName === 'birthDate') {
      if (errors['futureDate']) {
        return 'La fecha de nacimiento no puede ser futura';
      }
      if (errors['tooOld']) {
        return 'La fecha de nacimiento no puede ser anterior a 1900';
      }
    }

    return 'Campo inválido';
  }

  /**
   * Enviar formulario
   */
  onSubmit(): void {
    this.submitted = true;
    this.error = '';

    // Validar formulario
    if (this.patientForm.invalid) {
      this.markFormGroupTouched(this.patientForm);
      return;
    }

    this.loading = true;

    const patientData = this.patientForm.value;

    if (this.isEditMode && this.patientId) {
      // Actualizar paciente existente
      this.updatePatient(this.patientId, patientData);
    } else {
      // Crear nuevo paciente
      this.createPatient(patientData);
    }
  }

  /**
   * Crear nuevo paciente
   */
  createPatient(patientData: PatientCreate): void {
    this.patientService
      .createPatient(patientData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/patients'], {
            queryParams: { success: 'Paciente creado exitosamente' }
          });
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  /**
   * Actualizar paciente existente
   */
  updatePatient(id: number, patientData: PatientUpdate): void {
    this.patientService
      .updatePatient(id, patientData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate(['/patients'], {
            queryParams: { success: 'Paciente actualizado exitosamente' }
          });
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  /**
   * Cancelar y volver a la lista
   */
  cancel(): void {
    if (this.patientForm.dirty) {
      const confirmed = confirm('¿Está seguro? Los cambios no guardados se perderán.');
      if (!confirmed) {
        return;
      }
    }
    this.router.navigate(['/patients']);
  }

  /**
   * Marcar todos los campos como tocados para mostrar errores
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  /**
   * Resetear formulario
   */
  resetForm(): void {
    this.submitted = false;
    this.error = '';
    this.patientForm.reset();
  }

  /**
   * Obtener fecha de hoy en formato YYYY-MM-DD para el input date
   */
  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}