import { Video, FileText, Image, FileSpreadsheet, Presentation, File } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FileTypeIconProps {
  mimeType: string;
  className?: string;
}

function getFileCategory(mimeType: string): {
  icon: React.ReactNode;
  label: string;
  colorClass: string;
} {
  if (mimeType.startsWith('video/')) {
    return {
      icon: <Video className="w-4 h-4" />,
      label: 'Video',
      colorClass: 'text-purple-500',
    };
  }
  if (mimeType === 'application/pdf') {
    return {
      icon: <FileText className="w-4 h-4" />,
      label: 'PDF',
      colorClass: 'text-red-500',
    };
  }
  if (mimeType.startsWith('image/')) {
    return {
      icon: <Image className="w-4 h-4" />,
      label: 'Image',
      colorClass: 'text-green-500',
    };
  }
  if (
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return {
      icon: <FileSpreadsheet className="w-4 h-4" />,
      label: 'Spreadsheet',
      colorClass: 'text-emerald-500',
    };
  }
  if (
    mimeType === 'application/vnd.ms-powerpoint' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ) {
    return {
      icon: <Presentation className="w-4 h-4" />,
      label: 'Slides',
      colorClass: 'text-orange-500',
    };
  }
  if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return {
      icon: <FileText className="w-4 h-4" />,
      label: 'Document',
      colorClass: 'text-blue-500',
    };
  }
  return {
    icon: <File className="w-4 h-4" />,
    label: 'File',
    colorClass: 'text-muted-foreground',
  };
}

export default function FileTypeIcon({ mimeType, className }: FileTypeIconProps) {
  const { icon, label, colorClass } = getFileCategory(mimeType);

  return (
    <span className={`inline-flex items-center gap-1 ${className ?? ''}`}>
      <span className={colorClass}>{icon}</span>
      <Badge variant="outline" className="text-xs px-1.5 py-0">
        {label}
      </Badge>
    </span>
  );
}
