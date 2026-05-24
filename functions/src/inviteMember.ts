import {onCall, HttpsError} from 'firebase-functions/v2/https';
import {logger} from 'firebase-functions/v2';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore, FieldValue} from 'firebase-admin/firestore';
import {assertAdmin} from './util/auth';

type MemberRole = 'admin' | 'member';

interface InviteMemberInput {
    email: string;
    displayName: string;
    role: MemberRole;
}

interface InviteMemberOutput {
    memberId: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const inviteMember = onCall<InviteMemberInput, Promise<InviteMemberOutput>>(
    async (request) => {
        const caller = assertAdmin(request);
        const {email, displayName, role} = request.data ?? ({} as InviteMemberInput);
        if (!EMAIL_RE.test(email)) {
            throw new HttpsError('invalid-argument', 'A valid email is required.');
        }
        if (displayName.trim().length === 0) {
            throw new HttpsError('invalid-argument', 'displayName is required.');
        }
        if (role !== 'admin' && role !== 'member') {
            throw new HttpsError('invalid-argument', "role must be 'admin' or 'member'.");
        }
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedName = displayName.trim();
        const auth = getAuth();
        const firestore = getFirestore();
        let createdUid: string | null = null;
        try {
            const userRecord = await auth.createUser({
                email: normalizedEmail,
                emailVerified: false,
                displayName: normalizedName,
                disabled: false,
            });
            createdUid = userRecord.uid;
            await auth.setCustomUserClaims(createdUid, {role});
            await firestore.collection('members').doc(createdUid).create({
                email: normalizedEmail,
                displayName: normalizedName,
                role,
                status: 'invited',
                invitedBy: caller.uid,
                invitedAt: FieldValue.serverTimestamp(),
            });
            logger.info('Member invited', {
                memberId: createdUid,
                invitedBy: caller.uid,
                role,
            });
            return {memberId: createdUid};
        } catch (err) {
            if (err instanceof HttpsError) throw err;
            const code = (err as { code?: string })?.code;
            if (code === 'auth/email-already-exists') {
                throw new HttpsError('already-exists', 'A user with that email already exists.');
            }
            logger.error('inviteMember failed', err);
            throw new HttpsError('internal', 'Failed to invite member.');
        }
    },
);
