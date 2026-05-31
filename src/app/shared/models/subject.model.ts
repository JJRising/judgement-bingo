export interface Subject {
  id: string;
  gameId: string;
  name: string;
  addedAt: Date;
  addedBy: string; // memberId of the user who added the subject
}
