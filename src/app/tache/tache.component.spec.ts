import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TacheComponent } from './tache.component';

describe('TacheComponent', () => {
  let component: TacheComponent;
  let fixture: ComponentFixture<TacheComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TacheComponent]
    });
    fixture = TestBed.createComponent(TacheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
