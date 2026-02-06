import { SPRING_CONFIG } from '@/src/lib/constants';
import { cn } from '@/src/lib/utils';
import { motion } from 'framer-motion';
import { ChevronLeft, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header({
  title,
  align = 'left',
  close,
}: {
  title: string;
  align?: 'left' | 'center' | 'right';
  close?: boolean;
}) {
  const router = useRouter();

  return (
    <div className="px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING_CONFIG}
        className="relative mb-4 flex items-center border-b border-border pb-4"
      >
        {/* Back button - always on left */}
        <button
          onClick={() => router.back()}
          className="flex h-10 pl-2 pr-4 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
          <p className="text-sm">Back</p>
        </button>

        {/* Title - positioned based on align prop */}
        <h1
          className={cn(
            'text-xl font-bold text-foreground',
            align === 'left' && 'ml-3',
            align === 'center' && 'absolute left-1/2 -translate-x-1/2',
            align === 'right' && 'ml-auto mr-3',
          )}
        >
          {title}
        </h1>

        {/* Close button - always on right if enabled */}
        {close && (
          <button
            onClick={() => router.back()}
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </motion.div>
    </div>
  );
}
