"use client";

/**
 * Auth — Phase 2 mutation hooks.
 *
 * Why these are separate from the other mutations:
 * - Login / register / google-login flows are NOT wrapped here. Those go
 *   through `AuthContext` which owns token persistence + user-state
 *   propagation. Wrapping them in a TanStack mutation would split that
 *   responsibility across two places — fragile.
 * - What IS wrapped here is the "post-login" action surface: password reset
 *   start/finish, email verification, freja identity verification, account
 *   deletion, freja student registration. None of those alter the auth token
 *   directly (the Freja flows poll separately for the AuthResponse), so they
 *   compose cleanly with TanStack.
 *
 * Each mutation exposes plain {data, error, isPending}; callers that need to
 * refresh `AuthContext.user` after a successful verify do so via the per-call
 * `onSuccess` option, e.g.:
 *   verifyEmail.mutate(payload, { onSuccess: () => refreshUser() })
 *
 * No invalidation by default — the affected data is `useAuth.user`, which is
 * NOT (yet) a TanStack query. When the AuthContext migration eventually
 * lands, callers can add `qc.invalidateQueries({ queryKey: qk.auth.session() })`
 * inside the success handler.
 */

import { useMutation } from "@tanstack/react-query";
import { authService } from "@/features/auth/services/auth-service";
import type {
  AuthResponse,
  FrejaAuthRef,
  FrejaRegisterResponse,
  PasswordResetFinalRequest,
  RegisterStudentRequest,
  StartPasswordResetRequest,
  UserDeleteFailureDTO,
  VerifyEmailRequest,
} from "@/types";

/**
 * Send the password-reset email. Public action — no auth required.
 */
export function useStartPasswordReset() {
  return useMutation<void, Error, StartPasswordResetRequest>({
    mutationFn: (payload) => authService.startPasswordReset(payload),
  });
}

/**
 * Set the new password with the reset token (clicked from email link).
 */
export function useResetPassword() {
  return useMutation<void, Error, PasswordResetFinalRequest>({
    mutationFn: (payload) => authService.resetPassword(payload),
  });
}

/**
 * Send an email-verification mail (used both before and after login).
 */
export function useVerifyEmail() {
  return useMutation<void, Error, VerifyEmailRequest>({
    mutationFn: (payload) => authService.verifyEmail(payload),
  });
}

/**
 * Confirm the verification token from the email link. Caller usually
 * `refreshUser()`s after success so the AuthContext picks up `verified=true`.
 */
export function useFinalizeEmailVerification() {
  return useMutation<void, Error, string>({
    mutationFn: (id) => authService.finalizeEmailVerification(id),
  });
}

/**
 * Start a Freja identity-verification flow. Returns an `authRef` the page
 * uses to poll for completion (poll is read-side and stays in a separate
 * effect since it's a request-loop, not a mutation).
 */
export function useVerifyIdentity() {
  return useMutation<FrejaAuthRef, Error, void>({
    mutationFn: () => authService.verifyIdentity(),
  });
}

/**
 * Start a Freja **registration** flow (different endpoint from
 * verifyIdentity — this one creates a new account, while verifyIdentity
 * attaches Freja-confirmed identity data to an existing one). Returns an
 * `authRef` the page polls.
 */
export function useFrejaRegister() {
  return useMutation<FrejaRegisterResponse, Error, void>({
    mutationFn: () => authService.frejaRegister(),
  });
}

/**
 * Submit student-registration details. Returns the AuthResponse the caller
 * passes to AuthContext.completeAuth to lift the session into context.
 *
 * The onboarding modal calls this via mutateAsync(); on success it forwards
 * the response to AuthContext.completeAuth and closes the modal.
 */
export function useRegisterStudent() {
  return useMutation<AuthResponse, Error, RegisterStudentRequest>({
    mutationFn: (payload) => authService.registerStudent(payload),
  });
}

/**
 * Permanent account deletion. The success payload is either an empty
 * object (deletion went through) or a `UserDeleteFailureDTO` explaining why
 * the backend declined. Callers branch on the discriminant.
 */
export function useDeleteMe() {
  return useMutation<
    Record<string, unknown> | UserDeleteFailureDTO,
    Error,
    void
  >({
    mutationFn: () => authService.deleteMe(),
  });
}
