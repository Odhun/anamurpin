import { Metadata } from 'next';
import PinPageClient from './PinPageClient';

interface Props {
  params: { reportId: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Pin #${params.reportId.slice(0, 8)} — AnamurPin`,
    description: 'AnamurPin üzerinde paylaşılan yerel haber',
  };
}

export default function PinPage({ params }: Props) {
  return <PinPageClient reportId={params.reportId} />;
}
