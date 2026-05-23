export interface GameModel {
    id: number;
    name: string;
    description: string;
    ownerId: string;
    createdAt: Date;
    sessionStartDate: Date;
    sessionEndDate: Date;
}