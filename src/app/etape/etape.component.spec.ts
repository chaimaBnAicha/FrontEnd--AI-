import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EtapeComponent } from './etape.component';

describe('EtapeComponent', () => {
  let component: EtapeComponent;
  let fixture: ComponentFixture<EtapeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EtapeComponent]
    });
    fixture = TestBed.createComponent(EtapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
