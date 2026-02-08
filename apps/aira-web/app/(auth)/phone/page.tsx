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
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const { logout } = useAuthActions();

  const isValidPhone = phoneNumber.length >= 7 && phoneNumber.length <= 15;

  const handleContinue = async () => {
    if (!isValidPhone || isUpdating) return;

    // Combine country code and phone number
    const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;

    updateUser(
      { p_n: fullPhone },
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
          className="absolute -top-16 right-0 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
                AiRA needs your phone number to get started.
              </p>
            </div>

            {/* Assistant Avatar - visible on larger screens */}
            <div className="hidden md:block">
              <AssistantAvatar size="md" />
            </div>
          </div>

          {/* Phone Input */}
          <div className="space-y-4">
            <PhoneInput
              countryCode={countryCode}
              phoneNumber={phoneNumber}
              onCountryChange={setCountryCode}
              onPhoneChange={setPhoneNumber}
              disabled={isUpdating}
            />
            
            {/* Mobile Avatar */}
            <div className="flex justify-center md:hidden py-4">
              <AssistantAvatar size="lg" />
            </div>

            <Button
              onClick={handleContinue}
              disabled={!isValidPhone || isUpdating}
              size="default"
              className="w-full h-12 text-base"
            >
              {isUpdating ? 'Verifying...' : 'Continue'}
            </Button>
            
            <p className="text-center text-xs text-muted-foreground">
              We&apos;ll send a verification code to this number. 
              Standard message rates may apply.
            </p>
          </div>
        </motion.div>
      </div>
    </AuthLayout>
  );
}
