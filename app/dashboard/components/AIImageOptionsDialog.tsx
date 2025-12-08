"use client";

import { Sparkles, FileText, Wand2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface AIImageOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateForMe: () => void;
  onGiveMePrompt: () => void;
  loading?: boolean;
}

export function AIImageOptionsDialog({
  open,
  onOpenChange,
  onGenerateForMe,
  onGiveMePrompt,
  loading = false,
}: AIImageOptionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            AI Image Generation
          </DialogTitle>
          <DialogDescription>
            Choose how you'd like to generate your image
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Option 1: Generate for Me */}
          <button
            onClick={onGenerateForMe}
            disabled={loading}
            className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 p-6 text-left transition-all duration-300 hover:border-purple-400 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />

            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30 transition-transform group-hover:scale-110">
                <Wand2 className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Generate for Me
              </h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Let our AI create a stunning image automatically based on your
                content
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <Badge
                    variant="outline"
                    className="border-green-300 text-green-700 bg-green-50"
                  >
                    ✓ Instant
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-green-300 text-green-700 bg-green-50"
                  >
                    ✓ Automatic
                  </Badge>
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>✓ No external tools needed</p>
                <p>✓ Perfectly matched to content</p>
                <p>✓ Regenerate anytime</p>
              </div>
            </div>
          </button>

          {/* Option 2: Give Me a Prompt */}
          <button
            onClick={onGiveMePrompt}
            disabled={loading}
            className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 p-6 text-left transition-all duration-300 hover:border-blue-400 hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />

            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-110">
                <FileText className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Give Me a Prompt
              </h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Get an AI-generated prompt and create the image using free tools
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <Badge
                    variant="outline"
                    className="border-blue-300 text-blue-700 bg-blue-50"
                  >
                    ✓ Free Tools
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-blue-300 text-blue-700 bg-blue-50"
                  >
                    ✓ More Control
                  </Badge>
                </div>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>✓ Use Google, Bing, Leonardo AI</p>
                <p>✓ Customize the result</p>
                <p>✓ Multiple style options</p>
              </div>
            </div>
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Popular Free Image Generation Tools
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-600">
            <div>• Google AI Studio</div>
            <div>• Bing Image Creator</div>
            <div>• Leonardo AI</div>
            <div>• Craiyon</div>
            <div>• DALL-E (OpenAI)</div>
            <div>• Midjourney</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
