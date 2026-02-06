'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingCarousel } from '@/components/auth/onboarding-carousel';
import { useLocalStorage } from '@/hooks';

const ONBOARDING_KEY = 'aira_has_onboarded';

export default function OnboardingPage() {
  const router = useRouter();
  const [hasOnboarded, setHasOnboarded] = useLocalStorage(
    ONBOARDING_KEY,
    false,
  );

  // Redirect if already onboarded
  useEffect(() => {
    if (hasOnboarded) {
      router.replace('/signin');
    }
  }, [hasOnboarded, router]);

  const handleComplete = () => {
    setHasOnboarded(true);
    router.push('/signin');
  };

  // Don't render carousel if already onboarded
  if (hasOnboarded) {
    return null;
  }

  return <OnboardingCarousel onComplete={handleComplete} />;
}
