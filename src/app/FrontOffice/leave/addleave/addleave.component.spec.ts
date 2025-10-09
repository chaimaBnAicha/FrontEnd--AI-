import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddleaveComponent } from './addleave.component';

describe('AddleaveComponent', () => {
  let component: AddleaveComponent;
  let fixture: ComponentFixture<AddleaveComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddleaveComponent]
    });
    fixture = TestBed.createComponent(AddleaveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
