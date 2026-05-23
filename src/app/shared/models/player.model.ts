export type PlayerStatus = 'invited' | 'active' | 'kicked';

export interface Player {
  id: string;        // === memberId (Firebase Auth uid)
  memberId: string;  // redundant with id but explicit and queryable
  gameId: string;
  status: PlayerStatus;
  joinedAt: Date;
  invitedBy: string; // memberId of the inviter (game host/admin)
}
