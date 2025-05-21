'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import React from 'react';
import { FiArrowLeft } from 'react-icons/fi';

import { pathToProject } from '@/lib/constants';

export function ClientBackButton({ projectId }: { projectId?: string }) {
  const pathname = usePathname();

  // Extract projectId from URL if not provided as prop
  const extractedProjectId =
    projectId || pathname.match(/\/core\/projects\/([^\/]+)/)?.[1];

  // If we still don't have a projectId, return null
  if (!extractedProjectId) return null;

  const isMainProjectPage = pathname === `/core/projects/${extractedProjectId}`;

  if (isMainProjectPage) return null;

  return (
    <div className="w-full mt-4">
      <Link
        href={pathToProject(extractedProjectId)}
        className="flex items-center text-leaf-600 hover:text-leaf-700"
      >
        <FiArrowLeft className="w-4 h-4 mr-1" />
        Back to Project
      </Link>
    </div>
  );
}
