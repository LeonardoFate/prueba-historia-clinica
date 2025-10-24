import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientList } from './patient-list';

describe('PatientList', () => {
  let component: PatientList;
  let fixture: ComponentFixture<PatientList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
