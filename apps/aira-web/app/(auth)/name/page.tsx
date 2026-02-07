'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/components/layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUpdateUser } from '@repo/core';
import { ROUTES } from '@/lib/constants';

const MAX_NAME_LENGTH = 50;

export default function NamePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  const handleContinue = async () => {
    if (!name.trim() || isUpdating) return;

    // Split name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    updateUser(
      { f_n: firstName, l_n: lastName || undefined },
      {
        onSuccess: () => {
          router.push(ROUTES.HUB);
        },
        onError: error => {
          console.error('Failed to update name:', error);
        },
      },
    );
  };

  const handleSkip = () => {
    router.push(ROUTES.HUB);
  };

  return (
    <AuthLayout showBrand={false}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            What should we call you?
          </h1>
          <p className="mt-2 text-muted-foreground">
            This is how you&apos;ll appear in AiRA
          </p>
        </div>

        {/* Name Input */}
        <div className="relative">
          <Input
            type="text"
            value={name}
            onChange={e => setName(e.target.value.slice(0, MAX_NAME_LENGTH))}
            placeholder="Enter your name"
            className="h-14 text-lg"
            autoFocus
          />

          {/* Character count */}
          <AnimatePresence>
            {name.length > 0 && (
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -bottom-6 right-0 text-xs text-muted-foreground"
              >
                {name.length}/{MAX_NAME_LENGTH}
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Buttons */}
        <div className="space-y-3 pt-4">
          <Button
            onClick={handleContinue}
            disabled={!name.trim() || isUpdating}
            size="default"
            className="w-full"
          >
            {isUpdating ? 'Saving...' : 'Continue'}
          </Button>

          <Button
            onClick={handleSkip}
            variant="ghost"
            size="default"
            className="w-full text-muted-foreground"
          >
            Skip for now
          </Button>
        </div>
      </motion.div>
    </AuthLayout>
  );
}
