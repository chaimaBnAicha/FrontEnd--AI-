import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostTacheComponent } from './post-tache.component';

describe('PostTacheComponent', () => {
  let component: PostTacheComponent;
  let fixture: ComponentFixture<PostTacheComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PostTacheComponent]
    });
    fixture = TestBed.createComponent(PostTacheComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
