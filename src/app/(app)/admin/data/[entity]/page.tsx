'use client';
import { useParams, notFound } from 'next/navigation';
import MasterPage from '@/components/admin/MasterPage';
import { CONFIGS } from '@/lib/admin/configs';

export default function DataPage() {
  const { entity } = useParams<{ entity: string }>();
  const config = CONFIGS[entity];
  if (!config) notFound();
  // key forces a clean form/state reset when switching between entities
  return <MasterPage key={entity} config={config} />;
}
