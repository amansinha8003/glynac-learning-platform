'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Printer, Copy, Share2, Check, ArrowLeft, UserPen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface CertificateToolbarProps {
  courseSlug: string;
  learnerName: string;
  onUpdateName: (newName: string) => void;
}

export function CertificateToolbar({
  courseSlug,
  learnerName,
  onUpdateName,
}: CertificateToolbarProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [nameInput, setNameInput] = useState(learnerName);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCopyLink = async () => {
    if (typeof window !== 'undefined') {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Fallback
      }
    }
  };

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Certificate of Completion - Glynac Learn`,
            text: `I just completed this technical curriculum and earned an official certificate!`,
            url: window.location.href,
          });
          setShared(true);
          setTimeout(() => setShared(false), 2000);
        } catch {
          // User cancelled
        }
      } else {
        handleCopyLink();
      }
    }
  };

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateName(nameInput.trim());
    }
    setIsEditDialogOpen(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl border border-border bg-card shadow-xs no-print">
        {/* Left: Back Link */}
        <Button asChild variant="ghost" size="sm" className="gap-2 text-xs font-semibold self-start sm:self-auto">
          <Link href={`/courses/${courseSlug}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to Course
          </Link>
        </Button>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Edit Name Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNameInput(learnerName);
              setIsEditDialogOpen(true);
            }}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            <UserPen className="h-3.5 w-3.5 text-primary" />
            <span>Edit Name</span>
          </Button>

          {/* Copy Link Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </Button>

          {/* Share Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="h-8 gap-1.5 text-xs font-semibold"
          >
            {shared ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Shared</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>Share</span>
              </>
            )}
          </Button>

          {/* Primary Print / Save as PDF Button */}
          <Button
            size="sm"
            onClick={handlePrint}
            className="h-8 gap-1.5 text-xs font-bold shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / Save as PDF</span>
          </Button>
        </div>
      </div>

      {/* Edit Name Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Certificate Recipient</DialogTitle>
            <DialogDescription>
              Ensure your name matches your official credentials before printing or downloading this certificate.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Alex Rivera"
              maxLength={40}
              className="text-sm rounded-xl"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveName}>
              Apply Name
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

