import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import {MatListModule} from '@angular/material/list';
import {Member} from '@shared/models';

export interface AddPlayerDialogData {
  members: Member[];
}

@Component({
  selector: 'app-add-player-dialog',
  imports: [MatDialogModule, MatListModule],
  template: `
    <h2 mat-dialog-title>Add Player</h2>
    <mat-dialog-content>
      @if (data.members.length === 0) {
        <p>No available members to add.</p>
      } @else {
        <mat-selection-list [multiple]="false" (selectionChange)="onSelect($event)">
          @for (member of data.members; track member.id) {
            <mat-list-option [value]="member.id">
              <span matListItemTitle>{{ member.displayName }}</span>
              <span matListItemLine>{{ member.email }}</span>
            </mat-list-option>
          }
        </mat-selection-list>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
    </mat-dialog-actions>
  `,
})
export class AddPlayerDialog {
  private readonly dialogRef = inject(MatDialogRef<AddPlayerDialog>);
  readonly data = inject<AddPlayerDialogData>(MAT_DIALOG_DATA);

  onSelect(event: {options: {value: string}[]}): void {
    const selected = event.options[0]?.value;
    if (selected) {
      this.dialogRef.close(selected);
    }
  }
}
