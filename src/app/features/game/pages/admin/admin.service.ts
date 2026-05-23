import {inject, Injectable} from '@angular/core';
import {FIRESTORE} from '../../../../app.config';
import {
  collection,
  doc,
  Firestore,
  onSnapshot,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import {Player} from '@shared/models';
import {Observable} from 'rxjs';

const SUBCOLLECTION = 'players';

function toModel(gameId: string, d: {id: string; data: () => Record<string, unknown>}): Player {
  const data = d.data();
  return {
    id: d.id,
    memberId: data['memberId'] as string,
    gameId,
    status: data['status'] as Player['status'],
    joinedAt: (data['joinedAt'] as Timestamp)?.toDate() ?? new Date(),
    invitedBy: data['invitedBy'] as string,
  };
}

@Injectable({providedIn: 'root'})
export class PlayersService {
  private readonly firestore = inject(FIRESTORE) as Firestore;

  getPlayers(gameId: string): Observable<Player[]> {
    const colRef = collection(this.firestore, 'games', gameId, SUBCOLLECTION);
    return new Observable(subscriber => {
      return onSnapshot(colRef, snap => {
        subscriber.next(snap.docs.map(d => toModel(gameId, d as unknown as {id: string; data: () => Record<string, unknown>})));
      }, err => subscriber.error(err));
    });
  }

  async addPlayer(gameId: string, memberId: string, invitedBy: string): Promise<void> {
    const ref = doc(this.firestore, 'games', gameId, SUBCOLLECTION, memberId);
    await setDoc(ref, {
      memberId,
      gameId,
      status: 'invited',
      joinedAt: Timestamp.fromDate(new Date()),
      invitedBy,
    });
  }

  async kickPlayer(gameId: string, playerId: string): Promise<void> {
    const ref = doc(this.firestore, 'games', gameId, SUBCOLLECTION, playerId);
    await updateDoc(ref, {status: 'kicked'});
  }
}
