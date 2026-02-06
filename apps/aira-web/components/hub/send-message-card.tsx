'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Send,
  ImagePlus,
  X,
  Mic,
  Square,
  Play,
  Pause,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ImageAttachment {
  id: string;
  type: 'image';
  file: File;
  preview: string;
}

interface AudioAttachment {
  id: string;
  type: 'audio';
  file: File;
  url: string;
  duration: number;
}

export type Attachment = ImageAttachment | AudioAttachment;

// URL token detection and normalization for clickable links in subtitles
const URL_TOKEN_REGEX =
  /((?:https?:\/\/|https\/|http\/|www\.)[^\s]+|(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?)/g;

function normalizeUrlToken(token: string): string {
  const cleaned = token.trim().replace(/[),.!?]+$/, '');

  if (/^https\//i.test(cleaned)) {
    return cleaned.replace(/^https\//i, 'https://');
  }

  if (/^http\//i.test(cleaned)) {
    return cleaned.replace(/^http\//i, 'http://');
  }

  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned;
  }

  return `https://${cleaned.replace(/^www\./i, 'www.')}`;
}

function renderSubtitleWithLinks(text: string): React.ReactNode {
  const lines = text.split('\n');

  return lines.map((line, lineIndex) => {
    const matches = Array.from(line.matchAll(URL_TOKEN_REGEX));

    if (matches.length === 0) {
      return (
        <React.Fragment key={`line-${lineIndex}`}>
          {line}
          {lineIndex < lines.length - 1 ? <br /> : null}
        </React.Fragment>
      );
    }

    const nodes: React.ReactNode[] = [];
    let cursor = 0;

    matches.forEach((match, matchIndex) => {
      const token = match[0];
      const start = match.index ?? 0;

      if (start > cursor) {
        nodes.push(
          <React.Fragment key={`text-${lineIndex}-${matchIndex}`}>
            {line.slice(cursor, start)}
          </React.Fragment>,
        );
      }

      const href = normalizeUrlToken(token);

      nodes.push(
        <a
          key={`link-${lineIndex}-${matchIndex}`}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          className="underline decoration-primary/60 underline-offset-2 text-primary hover:text-primary/80"
        >
          {token}
        </a>,
      );

      cursor = start + token.length;
    });

    if (cursor < line.length) {
      nodes.push(
        <React.Fragment key={`tail-${lineIndex}`}>
          {line.slice(cursor)}
        </React.Fragment>,
      );
    }

    return (
      <React.Fragment key={`line-${lineIndex}`}>
        {nodes}
        {lineIndex < lines.length - 1 ? <br /> : null}
      </React.Fragment>
    );
  });
}

interface SendMessageCardProps {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  timestamp: string;
  onSend: (message: string, attachments: Attachment[]) => void;
  onDismiss?: () => void;
  className?: string;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function SendMessageCard({
  id: _id,
  title,
  subtitle,
  category,
  timestamp,
  onSend,
  onDismiss: _onDismiss,
  className,
}: SendMessageCardProps) {
  const [message, setMessage] = useState('');
  const [imageAttachments, setImageAttachments] = useState<ImageAttachment[]>(
    [],
  );
  const [audioAttachment, setAudioAttachment] =
    useState<AudioAttachment | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (audioAttachment?.url) {
        URL.revokeObjectURL(audioAttachment.url);
      }
      imageAttachments.forEach(img => URL.revokeObjectURL(img.preview));
    };
  }, [imageAttachments, audioAttachment?.url]);

  const hasContent =
    message.trim().length > 0 ||
    imageAttachments.length > 0 ||
    audioAttachment !== null;

  // Audio goes alone - disable text/image when audio is attached
  const hasAudio = audioAttachment !== null;
  const hasTextOrImage =
    message.trim().length > 0 || imageAttachments.length > 0;

  // Can only add images if not recording and no audio attached
  const canAddImages = !isRecording && !hasAudio;
  // Can only record if no text or image content
  const canRecord = !hasTextOrImage;

  const handleSend = useCallback(async () => {
    if (!hasContent || isSending) return;

    setIsSending(true);
    try {
      const attachments: Attachment[] = [...imageAttachments];
      if (audioAttachment) {
        attachments.push(audioAttachment);
      }
      onSend(message.trim(), attachments);
      setMessage('');
      setImageAttachments([]);
      setAudioAttachment(null);
    } finally {
      setIsSending(false);
    }
  }, [
    message,
    imageAttachments,
    audioAttachment,
    hasContent,
    isSending,
    onSend,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && hasContent) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend, hasContent],
  );

  const handleImageClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      if (file.type.startsWith('image/')) {
        // Revoke old preview URL if exists
        if (imageAttachments.length > 0) {
          URL.revokeObjectURL(imageAttachments[0].preview);
        }

        // Replace with new image
        setImageAttachments([
          {
            id: `img_${Date.now()}`,
            type: 'image',
            file,
            preview: URL.createObjectURL(file),
          },
        ]);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [imageAttachments],
  );

  const handleRemoveImage = useCallback((id: string) => {
    setImageAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter(a => a.id !== id);
    });
  }, []);

  const handleRemoveAudio = useCallback(() => {
    if (audioAttachment?.url) {
      URL.revokeObjectURL(audioAttachment.url);
    }
    setAudioAttachment(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, [audioAttachment]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        });
        const audioFile = new File(
          [audioBlob],
          `recording_${Date.now()}.webm`,
          { type: 'audio/webm' },
        );
        const audioUrl = URL.createObjectURL(audioBlob);

        setAudioAttachment({
          id: `audio_${Date.now()}`,
          type: 'audio',
          file: audioFile,
          url: audioUrl,
          duration: recordingDuration,
        });

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Could not access microphone. Please check your permissions.');
    }
  }, [recordingDuration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Don't save the recording
      audioChunksRef.current = [];
      setIsRecording(false);
      setRecordingDuration(0);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }

      // Stop all tracks
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach(track => track.stop());
    }
  }, [isRecording]);

  const togglePlayback = useCallback(() => {
    if (!audioAttachment) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioAttachment.url);
        audioRef.current.onended = () => setIsPlaying(false);
      }
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [audioAttachment, isPlaying]);

  const handleMicOrSendPress = useCallback(() => {
    if (hasContent) {
      handleSend();
    } else if (canRecord) {
      startRecording();
    }
  }, [hasContent, canRecord, handleSend, startRecording]);

  return (
    <div className={cn('w-full h-full flex flex-col', className)}>
      {/* Card Header */}
      <div className="mb-2">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {renderSubtitleWithLinks(subtitle)}
          </p>
        )}
      </div>

      {/* Meta info */}
      <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
        <span className="capitalize">{category}</span>
        <span>|</span>
        <span>{timestamp}</span>
      </div>

      {/* Spacer to push content to bottom */}
      <div className="flex-1" />

      {/* Recipient info */}
      <div className="flex items-center gap-2 mb-2 pt-2 border-t border-border">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500">
          <MessageCircle className="h-3 w-3 text-white" />
        </div>
        <span className="text-sm text-muted-foreground">To: AiRA</span>
      </div>

      {/* Image Attachment Preview */}
      <AnimatePresence>
        {imageAttachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2"
          >
            <div className="relative group inline-block">
              <Image
                height={56}
                width={56}
                src={imageAttachments[0].preview}
                alt="Attachment"
                className="h-14 w-14 object-cover rounded-lg border border-border"
                unoptimized
              />
              <button
                onClick={() => handleRemoveImage(imageAttachments[0].id)}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio Attachment Preview */}
      <AnimatePresence>
        {audioAttachment && !isRecording && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2"
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted border border-border">
              <button
                onClick={togglePlayback}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground"
              >
                {isPlaying ? (
                  <Pause className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5 ml-0.5" />
                )}
              </button>

              {/* Waveform visualization placeholder */}
              <div className="flex-1 flex items-center gap-0.5 h-5">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-primary/60 rounded-full"
                    style={{ height: `${Math.random() * 100}%`, minHeight: 4 }}
                  />
                ))}
              </div>

              <span className="text-xs text-muted-foreground font-mono">
                {formatDuration(audioAttachment.duration)}
              </span>

              <button
                onClick={handleRemoveAudio}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/20 hover:bg-muted-foreground/30 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recording UI */}
      {isRecording ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 rounded-full border border-destructive/50 bg-background p-1.5"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={cancelRecording}
          >
            Cancel
          </Button>

          {/* Recording wave animation */}
          <div className="flex-1 flex items-center justify-center gap-0.5 h-6">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-destructive rounded-full"
                animate={{
                  height: [4, Math.random() * 20 + 4, 4],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>

          <span className="text-sm font-mono text-foreground min-w-[45px] text-center">
            {formatDuration(recordingDuration)}
          </span>

          <Button
            type="button"
            size="icon"
            className="h-9 w-9 rounded-full bg-destructive hover:bg-destructive/90"
            onClick={stopRecording}
          >
            <Square className="h-3.5 w-3.5 fill-current" />
          </Button>
        </motion.div>
      ) : (
        /* Message Input */
        <div className="flex items-center gap-2 rounded-full border border-border bg-background p-1.5">
          {/* Image picker button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full shrink-0"
            onClick={handleImageClick}
            disabled={!canAddImages}
          >
            <ImagePlus
              className={cn(
                'h-5 w-5',
                canAddImages
                  ? 'text-muted-foreground'
                  : 'text-muted-foreground/50',
              )}
            />
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Text input */}
          <Input
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasAudio ? 'Audio attached' : 'Type your message...'}
            disabled={hasAudio}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-9 px-2 disabled:cursor-not-allowed disabled:opacity-50"
          />

          {/* Send/Mic button */}
          <Button
            type="button"
            size="icon"
            className={cn(
              'h-9 w-9 rounded-full shrink-0 transition-colors',
              hasContent
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-muted text-foreground hover:bg-muted/80',
            )}
            onClick={handleMicOrSendPress}
            disabled={isSending}
          >
            {hasContent ? (
              <Send className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
