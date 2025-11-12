'use client';

import { Suspense } from 'react';
import MultiEditForm from '@/features/inventory/components/MultiEditForm';

export default function EditPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MultiEditForm />
    </Suspense>
  );
}
