"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, Clock, Sparkles } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduledDate: string;
  setScheduledDate: (d: string) => void;
  scheduledTime: string;
  setScheduledTime: (t: string) => void;
  scheduling: boolean;
  onSchedule: () => Promise<void> | void;
};

export default function ScheduleDialog({
  open,
  onOpenChange,
  scheduledDate,
  setScheduledDate,
  scheduledTime,
  setScheduledTime,
  scheduling,
  onSchedule,
}: Props) {
  const minDate = React.useMemo(
    () => new Date().toISOString().split("T")[0],
    [],
  );

  const formattedDateTime = React.useMemo(() => {
    if (!scheduledDate || !scheduledTime) return null;

    const dateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    const now = new Date();
    const diffMs = dateTime.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );

    let timeUntil = "";
    if (diffDays > 0) {
      timeUntil = `in ${diffDays} day${diffDays > 1 ? "s" : ""}`;
      if (diffHours > 0) {
        timeUntil += ` and ${diffHours} hour${diffHours > 1 ? "s" : ""}`;
      }
    } else if (diffHours > 0) {
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      timeUntil = `in ${diffHours} hour${diffHours > 1 ? "s" : ""}`;
      if (diffMinutes > 0) {
        timeUntil += ` and ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`;
      }
    } else {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      timeUntil =
        diffMinutes > 0
          ? `in ${diffMinutes} minute${diffMinutes > 1 ? "s" : ""}`
          : "very soon";
    }

    return {
      formatted: dateTime.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      timeUntil,
    };
  }, [scheduledDate, scheduledTime]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-border bg-background shadow-2xl">
        <DialogHeader className="space-y-3 pb-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                Schedule Post
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1">
                Choose the perfect time to publish on LinkedIn
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-6">
          {/* Date Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={minDate}
                className="w-full px-4 py-3 border border-border bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-foreground font-medium disabled:bg-muted disabled:cursor-not-allowed"
                disabled={scheduling}
              />
            </div>
          </div>

          {/* Time Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Time
            </label>
            <div className="relative">
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-4 py-3 border border-border bg-background rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 text-foreground font-medium disabled:bg-muted disabled:cursor-not-allowed"
                disabled={scheduling}
              />
            </div>
          </div>

          {/* Preview Card */}
          {formattedDateTime && (
            <div className="relative overflow-hidden rounded-xl bg-secondary/30 border border-border p-5 shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-full -ml-12 -mb-12" />

              <div className="relative space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">
                    Scheduled for
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-lg font-bold text-foreground">
                    {formattedDateTime.formatted}
                  </p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Publishing {formattedDateTime.timeUntil}
                  </p>
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Your post will be automatically published at the scheduled
                    time
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={scheduling}
            className="flex-1 sm:flex-none border-border hover:bg-secondary font-medium"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSchedule()}
            disabled={scheduling || !scheduledDate || !scheduledTime}
            className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 font-semibold transition-all duration-200"
          >
            {scheduling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Post
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
