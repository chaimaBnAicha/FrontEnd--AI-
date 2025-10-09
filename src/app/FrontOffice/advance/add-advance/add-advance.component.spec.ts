import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAdvanceComponent } from './add-advance.component';

describe('AddAdvanceComponent', () => {
  let component: AddAdvanceComponent;
  let fixture: ComponentFixture<AddAdvanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddAdvanceComponent]
    });
    fixture = TestBed.createComponent(AddAdvanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
