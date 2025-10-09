import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetAllRequestComponent } from './get-all-request.component';

describe('GetAllRequestComponent', () => {
  let component: GetAllRequestComponent;
  let fixture: ComponentFixture<GetAllRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GetAllRequestComponent]
    });
    fixture = TestBed.createComponent(GetAllRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
