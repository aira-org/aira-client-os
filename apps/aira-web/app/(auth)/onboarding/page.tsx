'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingCarousel } from '@/components/auth/onboarding-carousel';

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = () => {
    router.push('/signin');
  };

  return <OnboardingCarousel onComplete={handleComplete} />;
}
