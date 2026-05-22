import {inject, Injectable} from '@angular/core';
import {FIRESTORE} from '../../app.config';
import {addDoc, collection, onSnapshot, orderBy, query, Timestamp, where,} from 'firebase/firestore';
import {GameModel} from '@shared/models';
import {Observable} from 'rxjs';

const COLLECTION = 'games';

function toModel(doc: {id: unknown; data: () => Record<string, unknown>}): GameModel {
    const d = doc.data();
    return {
        id: doc.id as number,
        name: d['name'] as string,
        description: d['description'] as string,
        createdAt: (d['createdAt'] as Timestamp)?.toDate() ?? new Date(),
        sessionStartDate: (d['sessionStartDate'] as Timestamp)?.toDate() ?? new Date(),
        sessionEndDate: (d['sessionEndDate'] as Timestamp)?.toDate() ?? new Date(),
    };
}

@Injectable({providedIn: 'root'})
export class GamesService {
    private readonly firestore = inject(FIRESTORE);
    private readonly collectionRef = collection(this.firestore, COLLECTION);

    getGames(): Observable<GameModel[]> {
        return new Observable(subscriber => {
            return onSnapshot(this.collectionRef, snap => {
                subscriber.next(snap.docs.map(toModel));
            }, err => subscriber.error(err));
        });
    }

    searchGames(namePrefix: string): Observable<GameModel[]> {
        const q = query(
            this.collectionRef,
            orderBy('name'),
            where('name', '>=', namePrefix),
            where('name', '<', namePrefix + '\uf8ff'),
        );
        return new Observable(subscriber => {
            return onSnapshot(q, snap => {
                subscriber.next(snap.docs.map(toModel));
            }, err => subscriber.error(err));
        });
    }

    async createGame(game: Omit<GameModel, 'id'>): Promise<string> {
        const docRef = await addDoc(this.collectionRef, {
            ...game,
            createdAt: Timestamp.fromDate(game.createdAt),
            sessionStartDate: Timestamp.fromDate(game.sessionStartDate),
            sessionEndDate: Timestamp.fromDate(game.sessionEndDate),
        });
        return docRef.id;
    }
}
