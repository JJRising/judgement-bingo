import {inject, Injectable} from '@angular/core';
import {FIRESTORE} from '../../../../app.config';
import {
  collection,
  deleteDoc,
  doc,
  Firestore,
  onSnapshot,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import {Subject} from '@shared/models';
import {Observable} from 'rxjs';

const SUBCOLLECTION = 'subjects';

function toModel(gameId: string, d: {id: string; data: () => Record<string, unknown>}): Subject {
  const data = d.data();
  return {
    id: d.id,
    gameId,
    name: data['name'] as string,
    addedAt: (data['addedAt'] as Timestamp)?.toDate() ?? new Date(),
    addedBy: data['addedBy'] as string,
  };
}

@Injectable({providedIn: 'root'})
export class SubjectsService {
  private readonly firestore = inject(FIRESTORE) as Firestore;

  getSubjects(gameId: string): Observable<Subject[]> {
    const colRef = collection(this.firestore, 'games', gameId, SUBCOLLECTION);
    return new Observable(subscriber => {
      return onSnapshot(colRef, snap => {
        subscriber.next(snap.docs.map(d => toModel(gameId, d as unknown as {id: string; data: () => Record<string, unknown>})));
      }, err => subscriber.error(err));
    });
  }

  async addSubject(gameId: string, name: string, addedBy: string): Promise<void> {
    const ref = doc(collection(this.firestore, 'games', gameId, SUBCOLLECTION));
    await setDoc(ref, {
      name,
      gameId,
      addedAt: Timestamp.fromDate(new Date()),
      addedBy,
    });
  }

  async removeSubject(gameId: string, subjectId: string): Promise<void> {
    const ref = doc(this.firestore, 'games', gameId, SUBCOLLECTION, subjectId);
    await deleteDoc(ref);
  }
}
