import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEtapeComponent } from './edit-etape.component';

describe('EditEtapeComponent', () => {
  let component: EditEtapeComponent;
  let fixture: ComponentFixture<EditEtapeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditEtapeComponent]
    });
    fixture = TestBed.createComponent(EditEtapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
