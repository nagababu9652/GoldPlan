'use client';

import { useCallback, useRef, useState } from 'react';

/** Prevent a second submit before React has rendered the disabled button. */
export function useSingleSubmission() {
  const inFlight = useRef(false);
  const completed = useRef(false);
  const requestKey = useRef<{ payload: string; value: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const run = useCallback(async (work: () => Promise<void>) => {
    if (inFlight.current || completed.current) return;
    inFlight.current = true;
    setSubmitting(true);
    try {
      await work();
    } finally {
      inFlight.current = false;
      setSubmitting(completed.current);
    }
  }, []);

  const finish = useCallback(() => {
    completed.current = true;
    setSubmitting(true);
  }, []);

  const keyFor = useCallback((payload: unknown) => {
    const serialized = JSON.stringify(payload);
    if (requestKey.current?.payload !== serialized) {
      requestKey.current = { payload: serialized, value: crypto.randomUUID() };
    }
    return requestKey.current.value;
  }, []);

  const clearKey = useCallback(() => {
    requestKey.current = null;
  }, []);

  return { run, finish, submitting, keyFor, clearKey };
}
