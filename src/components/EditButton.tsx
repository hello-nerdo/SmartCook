import cn from 'classnames';
import Link from 'next/link';

import { FiEdit } from 'react-icons/fi';

interface EditButtonProps {
  href: string;
  className?: string;
}

export default function EditButton({ href, className = '' }: EditButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'text-mustard-600 rounded-lg transition-colors focus:ring-2 focus:ring-mustard-400 flex items-center gap-1',
        className
      )}
    >
      <FiEdit className="h-5 w-5 stroke-[2.5]" />
    </Link>
  );
}
