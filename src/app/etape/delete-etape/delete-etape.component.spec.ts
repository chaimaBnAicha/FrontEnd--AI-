import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteEtapeComponent } from './delete-etape.component';

describe('DeleteEtapeComponent', () => {
  let component: DeleteEtapeComponent;
  let fixture: ComponentFixture<DeleteEtapeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeleteEtapeComponent]
    });
    fixture = TestBed.createComponent(DeleteEtapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
