import { ApplicationConfig, provideBrowserGlobalErrorListeners, InjectionToken } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideNativeDateAdapter } from '@angular/material/core';
import { routes } from './app.routes';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { firebaseConfig } from '@environments/environment.default';

const firebaseApp = initializeApp(firebaseConfig)
const firestoreInstance = getFirestore(firebaseApp);
connectFirestoreEmulator(firestoreInstance, '127.0.0.1', 8080);

export const FIREBASE_APP = new InjectionToken<FirebaseApp>('firebase-app', {
  providedIn: 'root',
  factory: () => firebaseApp,
});

export const FIRESTORE = new InjectionToken<Firestore>('firestore', {
  providedIn: 'root',
  factory: () => firestoreInstance,
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideNativeDateAdapter(),
    provideRouter(routes)
  ]
};
