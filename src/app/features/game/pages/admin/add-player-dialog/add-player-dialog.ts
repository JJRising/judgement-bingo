import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import {MatListModule} from '@angular/material/list';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {Member, MemberRole} from '@shared/models';
import {MembersService} from '@shared/members.service';

export interface AddPlayerDialogData {
    members: Member[];
}

type DialogView = 'select' | 'invite';

@Component({
    selector: 'app-add-player-dialog',
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatListModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatProgressSpinnerModule,
    ],
    templateUrl: './add-player-dialog.html',
    styleUrl: './add-player-dialog.css',
})
export class AddPlayerDialog {
    private readonly dialogRef = inject(MatDialogRef<AddPlayerDialog, string>);
    private readonly membersService = inject(MembersService);
    private readonly fb = inject(FormBuilder);

    readonly data = inject<AddPlayerDialogData>(MAT_DIALOG_DATA);
    readonly view = signal<DialogView>('select');
    readonly submitting = signal(false);
    readonly errorMessage = signal<string | null>(null);

    readonly inviteForm = this.fb.nonNullable.group({
        email: ['', [Validators.required, Validators.email]],
        displayName: ['', Validators.required],
        role: ['member' as MemberRole, Validators.required],
    });

    constructor() {
        this.dialogRef.disableClose = false;
    }

    onSelect(event: { options: { value: string }[] }): void {
        const selected = event.options[0]?.value;
        if (selected) {
            this.dialogRef.close(selected);
        }
    }

    onBack(): void {
        if (this.submitting()) return;
        this.errorMessage.set(null);
        this.view.set('select');
    }

    async onInvite(): Promise<void> {
        if (this.inviteForm.invalid || this.submitting()) return;

        this.submitting.set(true);
        this.errorMessage.set(null);
        this.dialogRef.disableClose = true;

        const {email, displayName, role} = this.inviteForm.getRawValue();

        try {
            const {memberId} = await this.membersService.invite({email, displayName, role});
            this.dialogRef.close(memberId);
        } catch (err) {
            this.errorMessage.set(this.toErrorMessage(err));
        } finally {
            this.submitting.set(false);
            this.dialogRef.disableClose = false;
        }
    }

    private toErrorMessage(err: unknown): string {
        const code = (err as { code?: string })?.code;
        if (code === 'functions/already-exists') {
            return 'A user with that email already exists.';
        }
        if (code === 'functions/permission-denied') {
            return 'You do not have permission to invite members.';
        }
        if (code === 'functions/unauthenticated') {
            return 'You need to be signed in to invite members.';
        }
        if (code === 'functions/invalid-argument') {
            return (err as { message?: string })?.message ?? 'Invalid input.';
        }
        return 'Failed to invite member. Please try again.';
    }
}
