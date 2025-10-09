import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEtapeComponent } from './add-etape.component';

describe('AddEtapeComponent', () => {
  let component: AddEtapeComponent;
  let fixture: ComponentFixture<AddEtapeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddEtapeComponent]
    });
    fixture = TestBed.createComponent(AddEtapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
