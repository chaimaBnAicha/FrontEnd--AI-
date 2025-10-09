import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListEtapeComponent } from './list-etape.component';

describe('ListEtapeComponent', () => {
  let component: ListEtapeComponent;
  let fixture: ComponentFixture<ListEtapeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListEtapeComponent]
    });
    fixture = TestBed.createComponent(ListEtapeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
