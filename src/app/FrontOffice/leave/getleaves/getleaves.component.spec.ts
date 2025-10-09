import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetleavesComponent } from './getleaves.component';

describe('GetleavesComponent', () => {
  let component: GetleavesComponent;
  let fixture: ComponentFixture<GetleavesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GetleavesComponent]
    });
    fixture = TestBed.createComponent(GetleavesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
