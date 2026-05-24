import { initializeApp } from 'firebase-admin/app';

initializeApp();

export { inviteMember } from './inviteMember';
export { onBeforeUserCreated, onBeforeUserSignedIn } from './blockingAuth';
