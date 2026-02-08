'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { AuthLayout } from '@/components/layout';
import { PhoneInput, AssistantAvatar } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { useUpdateUser, useAuthActions, queryClient } from '@repo/core';
import { webTokenStorage } from '@/lib/api';
import { ROUTES } from '@/lib/constants';

export default function PhonePage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const { logout } = useAuthActions();

  const cleanedPhone = phone.replace(/\D/g, '');
  const isValidPhone = cleanedPhone.length >= 8 && cleanedPhone.length <= 15;

  const formatPhoneNumber = (input: string): string => {
    const cleaned = input.replace(/\D/g, '');
    if (!cleaned) return '';
    if (cleaned.length <= 3) return `${cleaned}`;
    const formatted = cleaned.replace(/(\d{3})(?=\d)/g, '$1 ');
    return `${formatted}`;
  };

  const handleContinue = async () => {
    if (!isValidPhone || isUpdating) return;

    const formattedPhone = formatPhoneNumber(phone);

    updateUser(
      { p_n: formattedPhone.replace(/\s+/g, '') },
      {
        onSuccess: () => {
          // User is now active, redirect to hub
          router.replace(ROUTES.HUB);
        },
        onError: error => {
          console.error('Failed to update phone number:', error);
        },
      },
    );
  };

  const handleLogout = async () => {
    await logout(webTokenStorage);
    queryClient.clear();
    router.push(ROUTES.SIGNIN);
  };

  return (
    <AuthLayout showBrand={false}>
      <div className="relative">
        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="absolute -top-16 right-0 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                You&apos;re in!
              </h1>
              <p className="mt-2 text-muted-foreground">
                AiRA needs your phone number to get started
              </p>
             
            </div>

            {/* Assistant Avatar - visible on larger screens */}
            <div className="hidden md:block">
              <AssistantAvatar size="md" />
            </div>
          </div>

          {/* Phone Input */}
          <PhoneInput value={phone} onChange={setPhone} />

          {/* Mobile Avatar */}
          <div className="flex justify-center md:hidden">
            <AssistantAvatar size="lg" />
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={!isValidPhone || isUpdating}
            size="default"
            className="w-full"
          >
            {isUpdating ? 'Verifying...' : 'Continue'}
          </Button>

          {/* Info text */}
          <p className="text-center text-xs text-muted-foreground">
            Your phone number will be used for account verification
          </p>
        </motion.div>
      </div>
    </AuthLayout>
  );
}
