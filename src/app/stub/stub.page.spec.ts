import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StubPage } from './stub.page';

describe('StubPage', () => {
  let component: StubPage;
  let fixture: ComponentFixture<StubPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StubPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StubPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
