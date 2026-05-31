import {Component, inject, input, signal, effect} from '@angular/core';
import {Subject} from '@shared/models';
import {SubjectsService} from '../subjects.service';
import {AuthService} from '../../../../../auth/auth.service';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {AddSubjectDialog} from '../add-subject-dialog/add-subject-dialog';

@Component({
  selector: 'app-subject-list',
  imports: [MatButtonModule, MatIconModule, MatListModule, MatDialogModule],
  templateUrl: './subject-list.html',
  styleUrl: './subject-list.css',
})
export class SubjectList {
  private readonly subjectsService = inject(SubjectsService);
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  readonly gameId = input.required<string>();
  readonly subjects = signal<Subject[]>([]);

  constructor() {
    effect(() => {
      const id = this.gameId();
      if (id) {
        this.subjectsService.getSubjects(id).subscribe(s => this.subjects.set(s));
      }
    });
  }

  openAddSubjectDialog(): void {
    const ref = this.dialog.open(AddSubjectDialog, {
      width: '400px',
    });

    ref.afterClosed().subscribe((name: string | undefined) => {
      if (name && this.gameId()) {
        const memberId = this.auth.currentUser?.uid ?? '';
        void this.subjectsService.addSubject(this.gameId(), name, memberId);
      }
    });
  }

  removeSubject(subjectId: string): void {
    if (this.gameId()) {
      void this.subjectsService.removeSubject(this.gameId(), subjectId);
    }
  }
}
