import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SinusoidalComponent } from './sinusoidal.component';

describe('SinusoidalComponent', () => {
  let component: SinusoidalComponent;
  let fixture: ComponentFixture<SinusoidalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SinusoidalComponent]
    });
    fixture = TestBed.createComponent(SinusoidalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
