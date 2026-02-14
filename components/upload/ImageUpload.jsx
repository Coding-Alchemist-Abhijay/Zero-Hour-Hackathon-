"use client";

import { useState, useRef } from "react";
import { uploadImage, isCloudinaryConfigured } from "@/lib/cloudinary";
import { Button } from "@/components/ui/Button";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

const MAX_FILES = 5;
const MAX_SIZE_MB = 4;

export function ImageUpload({ value = [], onChange, disabled, className }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  async function handleFileSelect(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (!isCloudinaryConfigured()) {
      toast.error("Image upload is not configured. Add Cloudinary env variables.");
      return;
    }
    const current = value.length;
    if (current + files.length > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} images allowed.`);
      return;
    }
    for (const f of files) {
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`${f.name} is too large (max ${MAX_SIZE_MB}MB).`);
        continue;
      }
    }
    setUploading(true);
    try {
      const urls = [];
      for (const file of files.slice(0, MAX_FILES - current)) {
        const url = await uploadImage(file);
        urls.push(url);
      }
      onChange([...value, ...urls]);
      toast.success("Image(s) uploaded.");
    } catch (err) {
      toast.error(err.message ?? "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(url) {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div className={className ? `space-y-2 ${className}` : "space-y-2"}>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          disabled={disabled || uploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading || value.length >= MAX_FILES}
        >
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
          <span className="ml-2">{uploading ? "Uploading…" : "Add images"}</span>
        </Button>
        <span className="text-xs text-muted-foreground">
          {value.length}/{MAX_FILES} · max {MAX_SIZE_MB}MB each
        </span>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((url) => (
            <div key={url} className="relative group">
              <img
                src={url}
                alt="Upload"
                className="h-20 w-20 rounded-md border border-border object-cover"
              />
              {!disabled && (
                <button
                  type="button"
                  onClick={() => remove(url)}
                  className="absolute -top-1 -right-1 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-90 hover:opacity-100"
                  aria-label="Remove"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
