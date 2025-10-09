import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetAllTacheComponent } from './get-all-tache.component';

describe('GetAllTacheComponent', () => {
  let component: GetAllTacheComponent;
  let fixture: ComponentFixture<GetAllTacheComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GetAllTacheComponent]
    });
    fixture = TestBed.createComponent(GetAllTacheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
