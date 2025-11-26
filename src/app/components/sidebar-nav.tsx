'use client';

import React, { useState } from 'react';
import type { Folder } from '../lib/data';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Folder as FolderIcon, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FolderTreeProps {
  folder: Folder;
  currentFolderId: string;
  onSelectFolder: (id: string) => void;
  level?: number;
}

const FolderTree: React.FC<FolderTreeProps> = ({
  folder,
  currentFolderId,
  onSelectFolder,
  level = 0,
}) => {
  const [isOpen, setIsOpen] = useState(level < 1);
  const subFolders = folder.children.filter(
    (item) => item.type === 'folder'
  ) as Folder[];

  const hasSubFolders = subFolders.length > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <SidebarMenuItem>
        <div className="flex items-center w-full">
          {hasSubFolders ? (
              <CollapsibleTrigger asChild>
                <button className="p-1 -ml-1 rounded-md hover:bg-sidebar-accent/50 group-data-[collapsible=icon]:hidden">
                    <ChevronRight className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-90")} />
                </button>
              </CollapsibleTrigger>
          ) : <div className="w-6 h-6 group-data-[collapsible=icon]:hidden" />}

          <SidebarMenuButton
            onClick={() => onSelectFolder(folder.id)}
            isActive={folder.id === currentFolderId}
            tooltip={folder.name}
            className="flex-1"
          >
            <FolderIcon />
            <span>{folder.name}</span>
          </SidebarMenuButton>
        </div>
      </SidebarMenuItem>

      {hasSubFolders && (
        <CollapsibleContent>
            <SidebarMenuSub className="pl-6">
                {subFolders.map((subFolder) => (
                <SidebarMenuSubItem key={subFolder.id}>
                    <FolderTree
                        folder={subFolder}
                        currentFolderId={currentFolderId}
                        onSelectFolder={onSelectFolder}
                        level={level + 1}
                    />
                </SidebarMenuSubItem>
                ))}
            </SidebarMenuSub>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};

interface SidebarNavProps {
  root: Folder;
  currentFolderId: string;
  onSelectFolder: (id: string) => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({
  root,
  currentFolderId,
  onSelectFolder,
}) => {
  return (
    <SidebarMenu>
      <FolderTree
        folder={root}
        currentFolderId={currentFolderId}
        onSelectFolder={onSelectFolder}
      />
    </SidebarMenu>
  );
};

export default SidebarNav;
