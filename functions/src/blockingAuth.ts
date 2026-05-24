import {
  AuthBlockingEvent,
  beforeUserCreated,
  beforeUserSignedIn,
  HttpsError,
} from 'firebase-functions/v2/identity';
import {logger} from 'firebase-functions/v2';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';

type MemberRole = 'admin' | 'member';
type MemberStatus = 'invited' | 'active' | 'disabled';

interface MemberDoc {
  email: string;
  displayName: string;
  role: MemberRole;
  status: MemberStatus;
  invitedBy: string | null;
  invitedAt: FirebaseFirestore.Timestamp;
}

const NOT_INVITED = 'Your account is not on the invite list for this app.';
const DISABLED = 'Your account has been disabled.';

function normalizeEmail(email: string | undefined | null): string | null {
  if (!email) return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

async function findMemberByEmail(email: string): Promise<
  {id: string; data: MemberDoc} | null
> {
  const snap = await getFirestore()
    .collection('members')
    .where('email', '==', email)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return {id: doc.id, data: doc.data() as MemberDoc};
}

export const onBeforeUserCreated = beforeUserCreated(async (event: AuthBlockingEvent) => {
  const email = normalizeEmail(event.data?.email);
  const newUid = event.data?.uid;
  if (!email || !newUid) {
    throw new HttpsError('permission-denied', NOT_INVITED);
  }

  const existing = await findMemberByEmail(email);
  if (!existing) {
    logger.info('Blocked sign-up: email not in members allowlist', {email});
    throw new HttpsError('permission-denied', NOT_INVITED);
  }
  if (existing.data.status === 'disabled') {
    logger.info('Blocked sign-up: member disabled', {email, memberId: existing.id});
    throw new HttpsError('permission-denied', DISABLED);
  }

  if (existing.id !== newUid) {
    const firestore = getFirestore();
    const oldRef = firestore.collection('members').doc(existing.id);
    const newRef = firestore.collection('members').doc(newUid);
    await firestore.runTransaction(async tx => {
      tx.set(newRef, {
        ...existing.data,
        email,
        status: existing.data.status === 'invited' ? 'active' : existing.data.status,
      });
      tx.delete(oldRef);
    });

    try {
      await getAuth().deleteUser(existing.id);
    } catch (err) {
      logger.warn('Could not delete stale auth user for migrated member', {
        oldUid: existing.id,
        err,
      });
    }

    logger.info('Migrated member doc to new uid', {
      email,
      oldUid: existing.id,
      newUid,
    });
  }

  return {
    customClaims: {role: existing.data.role},
  };
});

export const onBeforeUserSignedIn = beforeUserSignedIn(async (event: AuthBlockingEvent) => {
  const uid = event.data?.uid;
  const email = normalizeEmail(event.data?.email);
  if (!uid) {
    throw new HttpsError('permission-denied', NOT_INVITED);
  }

  const firestore = getFirestore();
  const ref = firestore.collection('members').doc(uid);
  const snap = await ref.get();

  if (!snap.exists) {
    if (email) {
      const fallback = await findMemberByEmail(email);
      if (fallback && fallback.data.status !== 'disabled') {
        return {customClaims: {role: fallback.data.role}};
      }
    }
    logger.info('Blocked sign-in: no member doc for uid', {uid, email});
    throw new HttpsError('permission-denied', NOT_INVITED);
  }

  const data = snap.data() as MemberDoc;
  if (data.status === 'disabled') {
    logger.info('Blocked sign-in: member disabled', {uid});
    throw new HttpsError('permission-denied', DISABLED);
  }

  if (data.status === 'invited') {
    await ref.update({status: 'active'});
  }

  return {
    customClaims: {role: data.role},
  };
});
