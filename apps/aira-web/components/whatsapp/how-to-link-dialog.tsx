'use client';

import * as React from 'react';
import { useState } from 'react';
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

export function HowToLinkDialog({ open, onOpenChange }: HowToLinkDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);

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

        <div className="pt-0 pb-6">
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

        {/* Progress bar */}
        <div className="mb-4 h-1 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-whatsapp transition-all duration-500"
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
            }}
          />
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
