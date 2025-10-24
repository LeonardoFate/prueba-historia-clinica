
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PatientService } from '../../services/patient';
import { Patient } from '../../models/patient';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-list.html',
  styleUrl: './patient-list.css'
})
export class PatientList implements OnInit, OnDestroy {
  patients: Patient[] = [];
  loading: boolean = false;
  error: string = '';
  success: string = '';
  
  // Paginación
  currentPage: number = 1;
  totalPages: number = 1;
  totalRecords: number = 0;
  limit: number = 10;
  pages: number[] = [];
  
  // Búsqueda
  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Verificar si hay mensaje de éxito
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['success']) {
          this.success = params['success'];
          setTimeout(() => {
            this.router.navigate([], {
              queryParams: {},
              replaceUrl: true
            });
          }, 100);
        }
      });

    // debounce para búsqueda
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.currentPage = 1;
        this.loadPatients();
      });

    // Cargar pacientes 
    this.loadPatients();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cargar lista de pacientes
   */
  loadPatients(): void {
    this.loading = true;
    this.error = '';

    this.patientService
      .getPatients(this.currentPage, this.limit, this.searchTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.patients = response.patients;
          this.currentPage = response.pagination.currentPage;
          this.totalPages = response.pagination.totalPages;
          this.totalRecords = response.pagination.totalRecords;
          this.limit = response.pagination.limit;
          
          this.generatePageNumbers();
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
          this.patients = [];
        }
      });
  }

  /**
   * Generar números de página
   */
  generatePageNumbers(): void {
    this.pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      this.pages.push(i);
    }
  }

  /**
   * Manejar cambio en búsqueda
   */
  onSearchChange(searchTerm: string): void {
    this.searchSubject.next(searchTerm);
  }

  /**
   * Ir a una página específica
   */
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.loadPatients();
  }

  /**
   * Ir a página anterior
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  /**
   * Ir a página siguiente
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  /**
   * Navegar a crear paciente
   */
  createPatient(): void {
    this.router.navigate(['/patients/new']);
  }

  /**
   * Navegar a editar paciente
   */
  editPatient(id: number): void {
    this.router.navigate(['/patients/edit', id]);
  }

  /**
   * Eliminar paciente con confirmación
   */
  deletePatient(patient: Patient): void {
    const confirmed = confirm(
      `¿Está seguro de que desea eliminar al paciente ${this.getFullName(patient)}?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.patientService
      .deletePatient(patient.ID)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.success = `Paciente ${this.getFullName(patient)} eliminado exitosamente`;
          this.loadPatients();
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  /**
   * Obtener nombre completo del paciente
   */
  getFullName(patient: Patient): string {
    return `${patient.FIRST_NAME} ${patient.LAST_NAME}`;
  }

  /**
   * Calcular edad a partir de fecha de nacimiento
   */
  getAge(birthDate: string): number {
    return this.patientService.calculateAge(birthDate);
  }

  /**
   * Formatear fecha para mostrar
   */
  formatDate(date: string): string {
    return this.patientService.formatDate(date);
  }

  /**
   * Limpiar mensajes
   */
  clearMessages(): void {
    this.success = '';
    this.error = '';
  }
}