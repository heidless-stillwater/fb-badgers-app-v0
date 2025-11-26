import { FileArchive } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2 text-lg font-semibold text-primary-foreground group-data-[sidebar=sidebar]:text-sidebar-foreground">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary group-data-[sidebar=sidebar]:bg-sidebar-primary">
        <FileArchive className="h-5 w-5 text-primary-foreground group-data-[sidebar=sidebar]:text-sidebar-primary-foreground" />
      </div>
      <span className="group-data-[collapsible=icon]:hidden">FileBadger</span>
    </div>
  );
}
