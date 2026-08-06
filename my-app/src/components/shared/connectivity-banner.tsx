'use client';

import { useEffect, useState } from 'react';
import { CloudOff, X } from 'lucide-react';
import {
  subscribeToOfflineStatus,
  type OfflineEventDetail,
} from '@/lib/offline-store';

export function ConnectivityBanner() {
  const [status, setStatus] = useState<OfflineEventDetail | null>(null);
  useEffect(() => subscribeToOfflineStatus(setStatus), []);

  if (!status?.active) return null;

  return (
    <div
      role='status'
      className='mx-6 mt-4 flex items-start justify-between gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900'
    >
      <div className='flex items-start gap-2'>
        <CloudOff className='mt-0.5 size-4 shrink-0' />
        <div>
          <p className='font-semibold'>Modo de contingência ativo</p>
          <p>{status.message}</p>
        </div>
      </div>
      <button
        type='button'
        onClick={() => setStatus(null)}
        aria-label='Fechar aviso'
        className='rounded p-1 hover:bg-amber-100'
      >
        <X className='size-4' />
      </button>
    </div>
  );
}
