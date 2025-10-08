'use client';

import { ImageIcon, Copy, ExternalLink, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

interface ImagePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imagePrompt: string;
}

const IMAGE_TOOLS = [
  {
    name: 'Google AI Studio',
    url: 'https://aistudio.google.com/app/prompts/new_freeform',
    description: 'Free, unlimited generations',
    color: 'from-red-500 to-yellow-500',
  },
  {
    name: 'Bing Image Creator',
    url: 'https://www.bing.com/images/create',
    description: 'Powered by DALL-E 3',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Leonardo AI',
    url: 'https://leonardo.ai/',
    description: '150 free credits daily',
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'Craiyon',
    url: 'https://www.craiyon.com/',
    description: 'Free, no signup needed',
    color: 'from-green-500 to-teal-500',
  },
  {
    name: 'Ideogram',
    url: 'https://ideogram.ai/',
    description: 'High-quality, free tier',
    color: 'from-orange-500 to-red-500',
  },
  {
    name: 'Playground AI',
    url: 'https://playgroundai.com/',
    description: '500 images/day free',
    color: 'from-indigo-500 to-purple-500',
  },
];

export function ImagePromptDialog({
  open,
  onOpenChange,
  imagePrompt,
}: ImagePromptDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(imagePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenTool = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            Your AI Image Prompt
          </DialogTitle>
          <DialogDescription>
            Copy this prompt and use it in any free image generation tool below
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Prompt Display */}
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-6 max-h-[200px] overflow-y-auto">
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed font-mono">
                {imagePrompt}
              </p>
            </div>
            <Button
              variant={copied ? 'default' : 'outline'}
              size="sm"
              className={`absolute top-3 right-3 transition-all ${
                copied
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-white hover:bg-gray-50'
              }`}
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Prompt
                </>
              )}
            </Button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-blue-900 mb-2">
              How to use:
            </h4>
            <ol className="space-y-1 text-sm text-blue-800 list-decimal list-inside">
              <li>Copy the prompt above</li>
              <li>Click on any free tool below to open it</li>
              <li>Paste the prompt into the tool</li>
              <li>Generate your image</li>
              <li>Download and upload it to your post</li>
            </ol>
          </div>

          {/* Tools Grid */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Free Image Generation Tools
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {IMAGE_TOOLS.map((tool) => (
                <button
                  key={tool.name}
                  onClick={() => handleOpenTool(tool.url)}
                  className="group relative overflow-hidden rounded-xl border-2 border-gray-200 p-4 text-left transition-all duration-300 hover:border-gray-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${tool.color} opacity-10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150`} />
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-semibold text-gray-900 group-hover:text-gray-700">
                        {tool.name}
                      </h5>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                    <p className="text-xs text-gray-600">{tool.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pro Tips */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-sm text-purple-900 mb-2">
              💡 Pro Tips:
            </h4>
            <ul className="space-y-1 text-sm text-purple-800">
              <li>• Try multiple tools to compare results</li>
              <li>• You can modify the prompt for different styles</li>
              <li>• Generate 3-4 images and pick the best one</li>
              <li>• Most tools allow regeneration if you're not satisfied</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Got it! I'll generate the image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
