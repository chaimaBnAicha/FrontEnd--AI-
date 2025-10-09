import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvanceBackComponent } from './advance-back.component';

describe('AdvanceBackComponent', () => {
  let component: AdvanceBackComponent;
  let fixture: ComponentFixture<AdvanceBackComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdvanceBackComponent]
    });
    fixture = TestBed.createComponent(AdvanceBackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
