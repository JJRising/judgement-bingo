import {inject, Injectable} from '@angular/core';
import {FIRESTORE} from '../app.config';
import {
  collection,
  doc,
  Firestore,
  getDoc,
  onSnapshot,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import {Member} from '@shared/models';
import {Observable} from 'rxjs';

const COLLECTION = 'members';

function toModel(d: {id: string; data: () => Record<string, unknown>}): Member {
  const data = d.data();
  return {
    id: d.id,
    email: data['email'] as string,
    displayName: data['displayName'] as string,
    role: data['role'] as Member['role'],
    status: data['status'] as Member['status'],
    invitedBy: (data['invitedBy'] as string | null) ?? null,
    invitedAt: (data['invitedAt'] as Timestamp)?.toDate() ?? new Date(),
  };
}

@Injectable({providedIn: 'root'})
export class MembersService {
  private readonly firestore = inject(FIRESTORE) as Firestore;
  private readonly collectionRef = collection(this.firestore, COLLECTION);

  getMembers(): Observable<Member[]> {
    return new Observable(subscriber => {
      return onSnapshot(this.collectionRef, snap => {
        subscriber.next(snap.docs.map(toModel));
      }, err => subscriber.error(err));
    });
  }

  getMember(id: string): Observable<Member | null> {
    const ref = doc(this.firestore, COLLECTION, id);
    return new Observable(subscriber => {
      return onSnapshot(ref, snap => {
        subscriber.next(snap.exists() ? toModel(snap as unknown as {id: string; data: () => Record<string, unknown>}) : null);
      }, err => subscriber.error(err));
    });
  }

  async recordSignIn(uid: string): Promise<void> {
    const ref = doc(this.firestore, COLLECTION, uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const data = snap.data();
    if (data['status'] !== 'invited') return;

    await updateDoc(ref, {status: 'active'});
  }
}
