import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {MatError, MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatButton} from '@angular/material/button';

@Component({
    selector: 'app-new-game-dialog',
    imports: [
        MatDialogTitle,
        MatDialogContent,
        MatDialogActions,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatInput,
        MatError,
        MatSuffix,
        MatDatepickerModule,
        MatButton,
    ],
    templateUrl: './new-game-dialog.html',
    styleUrl: './new-game-dialog.css',
})
export class NewGameDialog {
    private fb = inject(FormBuilder);
    private dialogRef = inject(MatDialogRef<NewGameDialog>);

    form = this.fb.group({
        name: ['', Validators.required],
        description: [''],
        sessionDates: this.fb.group({
            sessionStartDate: [null as Date | null, Validators.required],
            sessionEndDate: [null as Date | null, Validators.required],
        }),
    });

    onSubmit() {
        if (this.form.valid) {
            const {name, description, sessionDates} = this.form.value;
            this.dialogRef.close({
                name,
                description,
                sessionStartDate: sessionDates?.sessionStartDate,
                sessionEndDate: sessionDates?.sessionEndDate,
                createdAt: new Date(),
            });
        }
    }

    onCancel() {
        this.dialogRef.close();
    }
}
