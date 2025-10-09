import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetTacheComponent } from './get-tache.component';

describe('GetTacheComponent', () => {
  let component: GetTacheComponent;
  let fixture: ComponentFixture<GetTacheComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GetTacheComponent]
    });
    fixture = TestBed.createComponent(GetTacheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
