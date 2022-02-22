import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemainingSunTimeComponent } from './remaining-sun-time.component';

describe('RemainingSunTimeComponent', () => {
  let component: RemainingSunTimeComponent;
  let fixture: ComponentFixture<RemainingSunTimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RemainingSunTimeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RemainingSunTimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
