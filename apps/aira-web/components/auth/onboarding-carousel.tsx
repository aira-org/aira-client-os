'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Shield, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface OnboardingCarouselProps {
  onComplete: () => void;
}

const slides = [
  {
    icon: Sparkles,
    title: 'Welcome to AiRA',
    subtitle: 'Your AI Rule Automation',
    description:
      'Automate your WhatsApp conversations and connected services with intelligent rules.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Zap,
    title: 'Smart Automation',
    subtitle: 'Work smarter, not harder',
    description:
      'Create rules that automatically respond to messages, manage tasks, and coordinate across services.',
    color: 'text-warning',
    bgColor: 'bg-warning/10',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    subtitle: 'Your data, your control',
    description:
      'Enterprise-grade security ensures your conversations and data remain private and protected.',
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
];

export function OnboardingCarousel({ onComplete }: OnboardingCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isLastSlide = currentSlide === slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      onComplete();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Skip button */}
        {!isLastSlide && (
          <div className="flex justify-end">
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Skip
            </button>
          </div>
        )}

        {/* Slide content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="flex justify-center"
            >
              <div className={cn('rounded-2xl p-6', slide.bgColor)}>
                <Icon className={cn('h-16 w-16', slide.color)} />
              </div>
            </motion.div>

            {/* Text */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-foreground">
                {slide.title}
              </h1>
              <p className={cn('text-lg font-medium', slide.color)}>
                {slide.subtitle}
              </p>
              <p className="text-muted-foreground">{slide.description}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Pagination dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                'h-2 rounded-full transition-all',
                index === currentSlide
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted hover:bg-muted-foreground',
              )}
            />
          ))}
        </div>

        {/* Action button */}
        <Button onClick={handleNext} size="lg" className="w-full">
          {isLastSlide ? (
            'Get Started'
          ) : (
            <>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
