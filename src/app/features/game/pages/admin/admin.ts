import {Component, inject, signal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PlayersService} from './admin.service';
import {MembersService} from '@shared/members.service';
import {Player, Member} from '@shared/models';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {AddPlayerDialog, AddPlayerDialogData} from './add-player-dialog/add-player-dialog';

@Component({
  selector: 'app-admin',
  imports: [MatButtonModule, MatIconModule, MatListModule, MatDialogModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  private readonly route = inject(ActivatedRoute);
  private readonly playersService = inject(PlayersService);
  private readonly membersService = inject(MembersService);
  private readonly dialog = inject(MatDialog);

  readonly players = signal<Player[]>([]);
  readonly members = signal<Member[]>([]);

  private readonly gameId = signal<string>('');

  constructor() {
    // :id is defined on the parent route (games/:id), not on this child (admin)
    this.route.parent!.paramMap.subscribe({
      next: params => {
        const id = params.get('id')!;
        this.gameId.set(id);
        this.playersService.getPlayers(id).subscribe(p => this.players.set(p));
      },
    });
    this.membersService.getMembers().subscribe(m => this.members.set(m));
  }

  openAddPlayerDialog(): void {
    const currentMemberIds = new Set(this.players().map(p => p.memberId));
    const available = this.members().filter(m => !currentMemberIds.has(m.id) && m.status !== 'disabled');

    const ref = this.dialog.open(AddPlayerDialog, {
      width: '400px',
      data: {members: available} satisfies AddPlayerDialogData,
    });

    ref.afterClosed().subscribe((memberId: string | undefined) => {
      if (memberId && this.gameId()) {
        this.playersService.addPlayer(this.gameId(), memberId, memberId);
      }
    });
  }

  kickPlayer(playerId: string): void {
    if (this.gameId()) {
      this.playersService.kickPlayer(this.gameId(), playerId);
    }
  }

  getMemberName(memberId: string): string {
    return this.members().find(m => m.id === memberId)?.displayName ?? memberId;
  }
}
