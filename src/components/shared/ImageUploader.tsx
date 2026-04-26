import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  value?: string | null;
  onChange: (dataUrl: string | null) => void;
  label?: string;
  hint?: string;
  className?: string;
  variant?: "dropzone" | "compact";
}

export function ImageUploader({
  value,
  onChange,
  label = "اضغط أو اسحب الصورة هنا",
  hint = "PNG, JPG حتى 5 ميجا",
  className,
  variant = "dropzone",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange((e.target?.result as string) ?? null);
    reader.readAsDataURL(file);
  };

  if (variant === "compact" && value) {
    return (
      <div className={cn("relative inline-block", className)}>
        <img
          src={value}
          alt=""
          className="w-24 h-24 object-cover rounded-lg border border-border"
        />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-elevated"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-border bg-muted">
          <img src={value} alt="معاينة" className="w-full h-64 object-contain bg-muted" />
          <div className="absolute top-3 left-3 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
            >
              تغيير
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => onChange(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "w-full border-2 border-dashed rounded-2xl px-6 py-12 flex flex-col items-center justify-center gap-3 transition-all",
            "hover:border-primary hover:bg-primary/5",
            dragging
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/30"
          )}
        >
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">{label}</p>
            <p className="text-sm text-muted-foreground mt-1">{hint}</p>
          </div>
        </button>
      )}
    </div>
  );
}
