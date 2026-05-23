export type MemberRole = 'admin' | 'member';
export type MemberStatus = 'invited' | 'active' | 'disabled';

export interface Member {
  id: string;
  email: string;
  displayName: string;
  role: MemberRole;
  status: MemberStatus;
  invitedBy: string | null;
  invitedAt: Date;
}
