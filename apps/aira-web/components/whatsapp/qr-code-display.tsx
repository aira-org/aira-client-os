'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { motion } from 'framer-motion';
import { Loader2, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QRCodeDisplayProps {
  code: string;
  className?: string;
  onShare?: () => void;
}

export function QRCodeDisplay({ code, className, onShare }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) {
      setIsLoading(true);
      return;
    }

    const generateQR = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Generate QR code as data URL
        const dataUrl = await QRCode.toDataURL(code, {
          errorCorrectionLevel: 'H',
          margin: 2,
          width: 280,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });

        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('Failed to generate QR code:', err);
        setError('Failed to generate QR code');
      } finally {
        setIsLoading(false);
      }
    };

    void generateQR();
  }, [code]);

  const handleShare = async () => {
    if (!qrDataUrl) return;

    try {
      // Convert data URL to blob
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'whatsapp-qr.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'WhatsApp Linking QR Code',
          text: 'Scan this QR code to link WhatsApp with AiRA',
          files: [file],
        });
        onShare?.();
      } else {
        // Fallback: download the image
        const link = document.createElement('a');
        link.href = qrDataUrl;
        link.download = 'whatsapp-qr.png';
        link.click();
        onShare?.();
      }
    } catch (err) {
      console.error('Failed to share QR code:', err);
    }
  };

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-2xl bg-destructive/10 p-8',
          className,
        )}
      >
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  if (isLoading || !qrDataUrl) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-2xl bg-muted p-8',
          className,
        )}
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative rounded-2xl bg-white p-4 shadow-lg"
      >
        <img
          src={qrDataUrl}
          alt="WhatsApp Linking QR Code"
          className="h-[280px] w-[280px]"
        />

        {/* Decorative corner markers */}
        <div className="absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-primary" />
        <div className="absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-primary" />
        <div className="absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-primary" />
        <div className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-primary" />
      </motion.div>

      <p className="text-center text-sm text-muted-foreground">
        Scan this QR code with your phone&apos;s WhatsApp app
      </p>

      {navigator.share && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShare}
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          <Share2 className="h-4 w-4" />
          Share QR Code
        </motion.button>
      )}
    </div>
  );
}
