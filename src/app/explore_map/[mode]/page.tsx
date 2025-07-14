'use client';

import { useParams } from 'next/navigation';
import ExplorePolygon from '@/components/explorePolygon/ExplorePolygon';
import ExploreLayering from '@/components/exploreLayer/ExploreLayer';

const Mode = () => {
  const { mode } = useParams();

  if (mode === 'polygon') return <ExplorePolygon />;
  if (mode === 'layer') return <ExploreLayering />;

  return <div className="p-4">Invalid mode: {mode}</div>;
};

export default Mode;
