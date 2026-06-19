"use client";

/**
 * Documents — TanStack Query hooks (Phase 1: reads only).
 *
 * `useMyDocuments` returns the current user's uploaded documents (passport,
 * lease addendum, etc.) used by the account documents section. Cached for
 * 30s because the user can upload from the same page and expects to see the
 * new doc soon after.
 *
 * Why not `staleTime: 0`? The list is rendered on the profile page only,
 * which is rarely navigated away from mid-edit. 30s is enough to avoid
 * re-fetches when child components remount, while still feeling fresh.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/query/keys";
import { useAuth } from "@/context/AuthContext";
import type { DocumentFileType } from "@/types/common";
import {
  documentService,
  type DeleteDocumentResultDTO,
  type DocumentPropagationResult,
  type UploadDocumentTargetDTO,
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

// ---------------------------------------------------------------------------
// MUTATIONS (Phase 2)
// ---------------------------------------------------------------------------

/**
 * Upload a document. The component owns per-file progress UI (the FileUpload
 * widget reports progress via its own props), so this hook only handles the
 * server round-trip and cache invalidation.
 *
 * Callers typically want to mirror the new upload into local state before
 * waiting for the invalidate-triggered refetch (so the new entry doesn't
 * disappear from the list during the round trip) — that pattern lives in
 * the component, not here.
 */
export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation<
    DocumentPropagationResult,
    Error,
    {
      file: File;
      targets?: UploadDocumentTargetDTO[];
      type?: DocumentFileType;
      // Caller-managed AbortSignal — the documents section ties this to a
      // per-row "Avbryt" button so the user can cancel a stuck upload.
      signal?: AbortSignal;
    }
  >({
    mutationFn: ({ file, targets, type, signal }) =>
      documentService.upload(file, { targets, type, signal }),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.documents.myInfo() });
    },
  });
}

/**
 * Delete a document by filesystem id. Optimistically removes the row from
 * the cached list; rolls back on error.
 */
export function useDeleteDocument() {
  const qc = useQueryClient();

  type Vars = string; // filesystemId
  type Ctx = { previous: UploadedDocument[] | undefined };

  return useMutation<DeleteDocumentResultDTO, Error, Vars, Ctx>({
    mutationFn: (filesystemId) => documentService.delete(filesystemId),

    onMutate: async (filesystemId) => {
      await qc.cancelQueries({ queryKey: qk.documents.myInfo() });
      const previous = qc.getQueryData<UploadedDocument[]>(qk.documents.myInfo());
      qc.setQueryData<UploadedDocument[]>(qk.documents.myInfo(), (current) =>
        (current ?? []).filter((entry) => entry.filesystemId !== filesystemId),
      );
      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(qk.documents.myInfo(), ctx.previous);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.documents.myInfo() });
    },
  });
}
