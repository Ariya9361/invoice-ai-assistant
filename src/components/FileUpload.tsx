import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Image, FileSpreadsheet, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  uploading?: boolean;
  accept?: string;
  maxSizeMB?: number;
}

const fileTypeIcon = (type: string) => {
  if (type.startsWith("image/")) return <Image className="w-8 h-8 text-chart-processing" />;
  if (type.includes("pdf")) return <FileText className="w-8 h-8 text-destructive" />;
  if (type.includes("sheet") || type.includes("csv") || type.includes("excel"))
    return <FileSpreadsheet className="w-8 h-8 text-chart-matched" />;
  return <FileText className="w-8 h-8 text-muted-foreground" />;
};

export function FileUpload({ onFileSelected, uploading, accept, maxSizeMB = 20 }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File exceeds ${maxSizeMB}MB limit`);
        return;
      }
      setSelectedFile(file);
      onFileSelected(file);
    },
    [maxSizeMB, onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          uploading && "pointer-events-none opacity-60"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept || ".pdf,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.webp"}
          onChange={handleChange}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-medium text-foreground">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-10 h-10 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              Drag & drop your file here
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, CSV, Excel, or Images up to {maxSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {selectedFile && !uploading && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary">
          {fileTypeIcon(selectedFile.type)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
          </div>
          <Button variant="ghost" size="icon" onClick={clearFile}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
