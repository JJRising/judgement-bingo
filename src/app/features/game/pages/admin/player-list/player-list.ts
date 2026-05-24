import {Component, inject, input, signal, computed, effect} from '@angular/core';
import {Player, Member} from '@shared/models';
import {PlayersService} from '../admin.service';
import {MembersService} from '@shared/members.service';
import {GamesService} from '@features/games/games.service';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {AddPlayerDialog, AddPlayerDialogData} from '../add-player-dialog/add-player-dialog';

@Component({
  selector: 'app-player-list',
  imports: [MatButtonModule, MatIconModule, MatListModule, MatDialogModule],
  templateUrl: './player-list.html',
  styleUrl: './player-list.css',
})
export class PlayerList {
  private readonly playersService = inject(PlayersService);
  private readonly membersService = inject(MembersService);
  private readonly gamesService = inject(GamesService);
  private readonly dialog = inject(MatDialog);

  readonly gameId = input.required<string>();
  readonly players = signal<Player[]>([]);
  readonly members = signal<Member[]>([]);
  readonly ownerId = signal<string>('');

  readonly isOwner = computed(() => (memberId: string) => memberId === this.ownerId());

  constructor() {
    this.membersService.getMembers().subscribe(m => this.members.set(m));

    effect(() => {
      const id = this.gameId();
      if (id) {
        this.playersService.getPlayers(id).subscribe(p => this.players.set(p));
        this.gamesService.getGame(id).subscribe(g => this.ownerId.set(g.ownerId));
      }
    });
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
        void this.playersService.addPlayer(this.gameId(), memberId, memberId);
      }
    });
  }

  kickPlayer(playerId: string): void {
    if (this.gameId()) {
      void this.playersService.kickPlayer(this.gameId(), playerId);
    }
  }

  getMemberName(memberId: string): string {
    return this.members().find(m => m.id === memberId)?.displayName ?? memberId;
  }
}
