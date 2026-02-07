'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Link2,
  Phone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HowToLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  {
    icon: Settings,
    title: 'Open WhatsApp Settings',
    description: 'Go to Settings > Linked Devices on your phone',
  },
  {
    icon: Link2,
    title: 'Tap "Link a Device"',
    description: 'Select the option to link a new device',
  },
  {
    icon: Phone,
    title: 'Use Phone Number',
    description: 'Choose "Link with phone number instead" and enter the code',
  },
];

export function HowToLinkModal({ open, onOpenChange }: HowToLinkModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onOpenChange(false);
      setCurrentStep(0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=" max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">
            How to Link WhatsApp
          </DialogTitle>
        </DialogHeader>

        {/* Animated content */}
        <div className="py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              {/* Icon */}
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-whatsapp/20">
                <Icon className="h-8 w-8 text-whatsapp" />
              </div>

              {/* Step indicator */}
              <p className="mb-2 text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </p>

              {/* Content */}
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted-foreground">{step.description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="mb-4 flex justify-center gap-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={cn(
                'h-2 rounded-full transition-all',
                index === currentStep
                  ? 'w-6 bg-whatsapp'
                  : 'w-2 bg-muted hover:bg-muted-foreground',
              )}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>

          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? (
              'Got it'
            ) : (
              <>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
