import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { NewGameDialog } from './new-game-dialog';

describe('NewGameDialog', () => {
  let component: NewGameDialog;
  let fixture: ComponentFixture<NewGameDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewGameDialog],
      providers: [
        provideNativeDateAdapter(),
        { provide: MatDialogRef, useValue: { close: () => {} } },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewGameDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
