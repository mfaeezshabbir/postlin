"use client";

import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar } from "lucide-react";

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
  const minDate = React.useMemo(() => new Date().toISOString().split("T")[0], []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Post</DialogTitle>
          <DialogDescription>
            Choose when you want this post to be published to LinkedIn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Date</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={minDate}
              className="w-full px-3 py-2 border rounded-md"
              disabled={scheduling}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Time</label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              disabled={scheduling}
            />
          </div>

          {scheduledDate && scheduledTime && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <strong>Post will be published on:</strong>
                <br />
                {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={scheduling}>
            Cancel
          </Button>
          <Button onClick={() => onSchedule()} disabled={scheduling || !scheduledDate || !scheduledTime}>
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
