import { HttpsError, CallableRequest } from 'firebase-functions/v2/https';

export function assertAdmin(request: CallableRequest<unknown>): { uid: string } {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign-in required.');
  }
  const role = request.auth.token['role'];
  if (role !== 'admin') {
    throw new HttpsError('permission-denied', 'Admin role required.');
  }
  return { uid: request.auth.uid };
}
