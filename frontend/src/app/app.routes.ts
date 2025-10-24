// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { PatientList } from './components/patient-list/patient-list';
import { PatientFormComponent } from './components/patient-form/patient-form';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/patients', 
    pathMatch: 'full' 
  },
  { 
    path: 'patients', 
    component: PatientList 
  },
  { 
    path: 'patients/new', 
    component: PatientFormComponent 
  },
  { 
    path: 'patients/edit/:id', 
    component: PatientFormComponent 
  },
  { 
    path: '**', 
    redirectTo: '/patients' 
  }
];