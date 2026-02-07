'use client';

import * as React from 'react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { AuthLayout } from '@/components/layout';
import { OTPInput } from '@/components/auth';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';

  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOTPComplete = async (value: string) => {
    setIsVerifying(true);
    setError(false);

    // TODO: Verify OTP with API
    console.log('Verifying OTP:', value);

    // Simulate API call
    setTimeout(() => {
      // Simulate success/failure
      const success = value === '123456'; // Demo: use 123456 as valid OTP

      if (success) {
        router.push('/name');
      } else {
        setError(true);
        setOtp('');
        setIsVerifying(false);
      }
    }, 1500);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;

    // TODO: Resend OTP
    console.log('Resending OTP to:', phone);
    setResendTimer(30);
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
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Enter verification code
          </h1>
          <p className="mt-2 text-muted-foreground">
            We sent a 6-digit code to{' '}
            <span className="text-foreground">{phone || 'your phone'}</span>
          </p>
        </div>

        {/* OTP Input */}
        <OTPInput
          value={otp}
          onChange={setOtp}
          onComplete={handleOTPComplete}
          error={error}
        />

        {/* Error message */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-destructive"
          >
            Invalid code. Please try again.
          </motion.p>
        )}

        {/* Loading state */}
        {isVerifying && (
          <div className="flex justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {/* Resend */}
        <div className="text-center">
          {resendTimer > 0 ? (
            <p className="text-sm text-muted-foreground">
              Resend code in{' '}
              <span className="text-foreground">{resendTimer}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-sm text-primary hover:underline"
            >
              Resend code
            </button>
          )}
        </div>

        {/* Demo hint */}
        <p className="text-center text-xs text-muted-foreground">
          Demo: Enter 123456 to continue
        </p>
      </motion.div>
    </AuthLayout>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout showBrand={false}>
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </AuthLayout>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
