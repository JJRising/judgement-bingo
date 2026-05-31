import {Component, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

@Component({
  selector: 'app-add-subject-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './add-subject-dialog.html',
  styleUrl: './add-subject-dialog.css',
})
export class AddSubjectDialog {
  private readonly dialogRef = inject(MatDialogRef<AddSubjectDialog, string>);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value.name!);
    }
  }
}
