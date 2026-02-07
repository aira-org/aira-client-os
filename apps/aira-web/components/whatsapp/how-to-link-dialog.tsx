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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HowToLinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const qrSteps = [
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
    title: 'Scan QR Code',
    description: 'Point your phone camera at the QR code shown on screen',
  },
];

const codeSteps = [
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
    description: 'Choose "Link with phone number instead" and enter the code shown',
  },
];

export function HowToLinkDialog({ open, onOpenChange }: HowToLinkDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [linkMethod, setLinkMethod] = useState<'qr' | 'code'>('qr');

  const steps = linkMethod === 'qr' ? qrSteps : codeSteps;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onOpenChange(false);
      setCurrentStep(0);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle className="text-center">How to Link WhatsApp</SheetTitle>
        </SheetHeader>

        {/* Method Toggle */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              setLinkMethod('qr');
              setCurrentStep(0);
            }}
            className={cn(
              'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
              linkMethod === 'qr'
                ? 'border-whatsapp bg-whatsapp/10 text-whatsapp'
                : 'border-border bg-background text-muted-foreground hover:bg-accent',
            )}
          >
            QR Code
          </button>
          <button
            onClick={() => {
              setLinkMethod('code');
              setCurrentStep(0);
            }}
            className={cn(
              'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
              linkMethod === 'code'
                ? 'border-whatsapp bg-whatsapp/10 text-whatsapp'
                : 'border-border bg-background text-muted-foreground hover:bg-accent',
            )}
          >
            Manual Code
          </button>
        </div>

        <div className="py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              {/* Icon */}
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-whatsapp/20">
                <Icon className="h-8 w-8 text-whatsapp" />
              </div>

              {/* Step number */}
              <p className="mb-2 text-sm text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </p>

              {/* Content */}
              <h3 className="text-lg font-semibold text-foreground">
                {step.title}
              </h3>
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
      </SheetContent>
    </Sheet>
  );
}
