"use client";

import { useState } from "react";
import {
  Upload,
  X,
  Image as ImageIcon,
  Video as VideoIcon,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToasts } from "@/components/ToastProvider";

interface MediaUploadProps {
  onImageSelect: (file: File) => void;
  onVideoSelect: (file: File) => void;
  onAIImageRequest: () => void;
  imagePreview: string | null;
  videoPreview: string | null;
  onRemoveMedia: () => void;
  disabled?: boolean;
}

export function MediaUpload({
  onImageSelect,
  onVideoSelect,
  onAIImageRequest,
  imagePreview,
  videoPreview,
  onRemoveMedia,
  disabled = false,
}: MediaUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const { push } = useToasts();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (file.type.startsWith("image/")) {
      validateAndSelectImage(file);
    } else if (file.type.startsWith("video/")) {
      validateAndSelectVideo(file);
    } else {
      push({
        title: "Invalid File Type",
        description: "Please drop an image or video file",
        variant: "error",
      });
    }
  };

  const validateAndSelectImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      push({
        title: "Invalid File Type",
        description: "Please select an image file",
        variant: "error",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      push({
        title: "File Too Large",
        description: "Image size must be less than 10MB",
        variant: "error",
      });
      return;
    }

    onImageSelect(file);
  };

  const validateAndSelectVideo = (file: File) => {
    if (!file.type.startsWith("video/")) {
      push({
        title: "Invalid File Type",
        description: "Please select a video file",
        variant: "error",
      });
      return;
    }

    // LinkedIn video limits
    if (file.size > 200 * 1024 * 1024) {
      push({
        title: "File Too Large",
        description:
          "Video size must be less than 200MB (recommended). Maximum is 5GB but large files may take longer to upload.",
        variant: "error",
      });
      return;
    }

    // Get video duration
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration;

      if (duration < 3 || duration > 600) {
        push({
          title: "Invalid Video Duration",
          description: "Video duration must be between 3 seconds and 10 minutes",
          variant: "error",
        });
        return;
      }

      onVideoSelect(file);
    };

    video.src = URL.createObjectURL(file);
  };

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelectImage(file);
  };

  const handleVideoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelectVideo(file);
  };

  // If media is already uploaded, show preview
  if (imagePreview || videoPreview) {
    return (
      <div className="relative rounded-xl overflow-hidden">
        {imagePreview && (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-xl"
            />
            <Badge className="absolute top-3 left-3 bg-blue-500 text-white">
              <ImageIcon className="w-3 h-3 mr-1" />
              Image
            </Badge>
          </div>
        )}
        {videoPreview && (
          <div className="relative">
            <video
              src={videoPreview}
              controls
              className="w-full h-64 object-cover rounded-xl"
            />
            <Badge className="absolute top-3 left-3 bg-purple-500 text-white">
              <VideoIcon className="w-3 h-3 mr-1" />
              Video
            </Badge>
          </div>
        )}
        <button
          onClick={onRemoveMedia}
          disabled={disabled}
          className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Show upload options
  return (
    <div className="space-y-4">
      {/* AI Generate Option */}
      <button
        onClick={onAIImageRequest}
        disabled={disabled}
        className="w-full group relative overflow-hidden rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-3 text-left transition-all duration-300 hover:border-purple-400 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />

        <div className="relative flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 w-full">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">
                Generate Image with AI
              </h4>
              <p className="text-[11px] text-gray-600">
                Let AI create a perfect image for your post
              </p>
            </div>
          </div>
        </div>
      </button>

      {/* Drag and Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragOver
            ? "border-blue-400 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-sm font-medium text-gray-700 mb-2">
          Drag & drop your media here
        </p>
        <p className="text-xs text-gray-500 mb-4">or click to browse</p>

        <div className="flex items-center justify-center gap-3">
          {/* Image Upload */}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageInputChange}
              disabled={disabled}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={disabled}
                asChild
              >
                <span>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Image
                </span>
              </Button>
            </label>
          </div>

          {/* Video Upload */}
          <div>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoInputChange}
              disabled={disabled}
              className="hidden"
              id="video-upload"
            />
            <label htmlFor="video-upload">
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                disabled={disabled}
                asChild
              >
                <span>
                  <VideoIcon className="w-4 h-4 mr-2" />
                  Video
                </span>
              </Button>
            </label>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <p>Images: PNG, JPG up to 10MB</p>
          <p>Videos: MP4, MOV up to 200MB (3s-10min duration)</p>
        </div>
      </div>
    </div>
  );
}
