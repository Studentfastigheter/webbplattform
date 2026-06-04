"use client";

/**
 * Documents — TanStack Query hooks (Phase 1: reads only).
 *
 * `useMyDocuments` returns the current user's uploaded documents (passport,
 * lease addendum, etc.) used by the profile documents section. Cached for
 * 30s because the user can upload from the same page and expects to see the
 * new doc soon after; mutations added in Phase 2 will invalidate this key.
 *
 * Why not `staleTime: 0`? The list is rendered on the profile page only,
 * which is rarely navigated away from mid-edit. 30s is enough to avoid
 * re-fetches when child components remount, while still feeling fresh.
 */

import { useQuery } from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import { useAuth } from "@/context/AuthContext";
import {
  documentService,
  type UploadedDocument,
} from "@/features/documents/services/document-service";

const STALE_30_SECONDS = 30_000;

export function useMyDocuments() {
  const { user } = useAuth();
  return useQuery<UploadedDocument[]>({
    queryKey: qk.documents.myInfo(),
    queryFn: () => documentService.list(),
    enabled: Boolean(user),
    staleTime: STALE_30_SECONDS,
  });
}
