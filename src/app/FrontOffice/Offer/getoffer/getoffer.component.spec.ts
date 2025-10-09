import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetofferComponent } from './getoffer.component';

describe('GetofferComponent', () => {
  let component: GetofferComponent;
  let fixture: ComponentFixture<GetofferComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GetofferComponent]
    });
    fixture = TestBed.createComponent(GetofferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
