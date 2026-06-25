import { HttpMethod } from '../types';

export const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

export const METHOD_COLORS: Record<HttpMethod, { text: string; bg: string; border: string }> = {
  GET: { text: 'text-[var(--method-get)]', bg: 'bg-[var(--method-get)]/10', border: 'border-[var(--method-get)]/20' },
  POST: { text: 'text-[var(--method-post)]', bg: 'bg-[var(--method-post)]/10', border: 'border-[var(--method-post)]/20' },
  PUT: { text: 'text-[var(--method-put)]', bg: 'bg-[var(--method-put)]/10', border: 'border-[var(--method-put)]/20' },
  PATCH: { text: 'text-[var(--method-patch)]', bg: 'bg-[var(--method-patch)]/10', border: 'border-[var(--method-patch)]/20' },
  DELETE: { text: 'text-[var(--method-delete)]', bg: 'bg-[var(--method-delete)]/10', border: 'border-[var(--method-delete)]/20' },
  HEAD: { text: 'text-[var(--method-head)]', bg: 'bg-[var(--method-head)]/10', border: 'border-[var(--method-head)]/20' },
  OPTIONS: { text: 'text-[var(--method-options)]', bg: 'bg-[var(--method-options)]/10', border: 'border-[var(--method-options)]/20' },
};

export const STATUS_COLORS: Record<number, string> = {
  2: 'text-[var(--status-2xx)] bg-[var(--status-2xx)]/10',
  3: 'text-[var(--status-3xx)] bg-[var(--status-3xx)]/10',
  4: 'text-[var(--status-4xx)] bg-[var(--status-4xx)]/10',
  5: 'text-[var(--status-5xx)] bg-[var(--status-5xx)]/10',
};
