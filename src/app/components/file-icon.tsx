import {
  File,
  FileCode,
  FileImage,
  FileText,
  FileVideo,
  FileArchive as ZipIcon,
  FileAudio,
} from 'lucide-react';
import React from 'react';

interface FileIconProps extends React.HTMLAttributes<SVGElement> {
    filename: string;
}

export const FileIcon: React.FC<FileIconProps> = ({ filename, className, ...props }) => {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  const getIcon = () => {
    if (!extension) return <File className={className} {...props} />;

    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
      case 'webp':
        return <FileImage className={className} {...props} />;
      case 'mp4':
      case 'mov':
      case 'avi':
        return <FileVideo className={className} {...props} />;
      case 'mp3':
      case 'wav':
      case 'ogg':
        return <FileAudio className={className} {...props} />;
      case 'doc':
      case 'docx':
      case 'txt':
      case 'pdf':
        return <FileText className={className} {...props} />;
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'html':
      case 'css':
      case 'json':
        return <FileCode className={className} {...props} />;
      case 'zip':
      case 'rar':
      case '7z':
        return <ZipIcon className={className} {...props} />;
      default:
        return <File className={className} {...props} />;
    }
  }

  return getIcon();
};
