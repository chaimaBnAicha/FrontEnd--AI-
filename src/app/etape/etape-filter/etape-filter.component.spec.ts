import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtapeFilterComponent } from './etape-filter.component';

describe('EtapeFilterComponent', () => {
  let component: EtapeFilterComponent;
  let fixture: ComponentFixture<EtapeFilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EtapeFilterComponent]
    });
    fixture = TestBed.createComponent(EtapeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
