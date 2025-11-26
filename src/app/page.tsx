'use client';

import React, { useState, useMemo, useCallback, useRef, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from './providers/auth-provider';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarSeparator,
  SidebarFooter,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  File as FileItem,
  Folder as FolderItem,
  initialFileSystem,
} from './lib/data';
import {
  addToFileSystem,
  findFolder,
  findParent,
  removeFromFileSystem,
  renameInFileSystem,
} from './lib/file-system-helpers';
import SidebarNav from './components/sidebar-nav';
import FileBrowser from './components/file-browser';
import { Logo } from './components/logo';
import { Button } from '@/components/ui/button';
import { Upload, FolderPlus, Loader, List, Grid, LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ModeToggle } from '@/components/mode-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export type ViewType = "list" | "grid";
export type GridSize = "sm" | "md" | "lg";

export default function DrivePage() {
  const { user, loading, signOut } = useContext(AuthContext);
  const router = useRouter();
  const [fileSystem, setFileSystem] = useState<FolderItem>(initialFileSystem);
  const [currentFolderId, setCurrentFolderId] = useState('root');
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreateFolderOpen, setCreateFolderOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [view, setView] = useState<ViewType>("grid");
  const [gridSize, setGridSize] = useState<GridSize>("md");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  const currentFolder = useMemo(
    () => findFolder(fileSystem, currentFolderId),
    [fileSystem, currentFolderId]
  );

  const breadcrumbs = useMemo(() => {
    const path = [];
    let folderId: string | null = currentFolderId;
    while (folderId) {
      const folder = findFolder(fileSystem, folderId);
      if (folder) {
        path.unshift(folder);
        const parent = findParent(fileSystem, folderId);
        folderId = parent ? parent.id : null;
      } else {
        folderId = null;
      }
    }
    return path;
  }, [fileSystem, currentFolderId]);

  const handleCreateFolder = useCallback(() => {
    if (!newFolderName.trim()) {
      toast({
        title: 'Error',
        description: 'Folder name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    if (currentFolder) {
      const newFolder: FolderItem = {
        id: `folder-${Date.now()}`,
        name: newFolderName.trim(),
        type: 'folder',
        children: [],
      };
      setFileSystem(
        (prevFs) => addToFileSystem(prevFs, currentFolder.id, newFolder) as FolderItem
      );
      toast({
        title: 'Success',
        description: `Folder "${newFolderName.trim()}" created.`,
      });
    }
    setNewFolderName('');
    setCreateFolderOpen(false);
  }, [newFolderName, currentFolder, toast]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && currentFolder) {
      setIsUploading(true);
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = (e.target?.result as string).split(',')[1];
        const newFile: FileItem = {
          id: `file-${Date.now()}`,
          name: file.name,
          size: `${(file.size / 1024).toFixed(2)} KB`,
          modified: new Date(),
          type: 'file',
          content: fileContent,
        };
        setFileSystem(
          (prevFs) => addToFileSystem(prevFs, currentFolder.id, newFile) as FolderItem
        );
        toast({
          title: 'Success',
          description: `File "${file.name}" uploaded.`,
        });
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast({
            title: 'Error',
            description: 'Failed to read file.',
            variant: 'destructive',
        });
        setIsUploading(false);
      }
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleDeleteItem = useCallback((itemId: string, itemName: string) => {
    setFileSystem((prevFs) => removeFromFileSystem(prevFs, itemId) as FolderItem);
    toast({
      title: 'Item Deleted',
      description: `"${itemName}" has been moved to trash.`,
      variant: 'destructive',
    });
  }, [toast]);

  const handleRenameItem = useCallback((itemId: string, newName: string) => {
    setFileSystem((prevFs) => renameInFileSystem(prevFs, itemId, newName) as FolderItem);
    toast({
      title: 'Success',
      description: `Item renamed to "${newName}".`,
    });
  }, [toast]);

  if (loading || !user) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <div className="p-2 flex flex-col gap-2">
            <Button
              className="w-full justify-start"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {isUploading ? 'Uploading...' : 'Upload File'}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={() => setCreateFolderOpen(true)}
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              New Folder
            </Button>
          </div>
          <SidebarSeparator />
          <SidebarNav
            root={fileSystem}
            currentFolderId={currentFolderId}
            onSelectFolder={setCurrentFolderId}
          />
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenuButton onClick={signOut} tooltip="Sign Out">
                <LogOut/>
                <span>Sign Out</span>
            </SidebarMenuButton>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen bg-background">
          <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold md:text-xl flex-1 truncate">
              {currentFolder?.name || 'My Drive'}
            </h1>
            <div className="flex items-center gap-4">
                <Button variant={view === 'list' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('list')}>
                    <List className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={view === 'grid' ? 'secondary' : 'ghost'} size="icon">
                            <Grid className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuRadioGroup value={gridSize} onValueChange={(value) => { setView('grid'); setGridSize(value as GridSize); }}>
                            <DropdownMenuRadioItem value="sm">Small</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="md">Medium</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="lg">Large</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                <ModeToggle />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user.photoURL || undefined} />
                                <AvatarFallback>
                                    <User />
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled>{user.email}</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={signOut}>Sign Out</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto">
            {currentFolder ? (
              <FileBrowser
                folder={currentFolder}
                breadcrumbs={breadcrumbs}
                onNavigate={setCurrentFolderId}
                onDeleteItem={handleDeleteItem}
                onRenameItem={handleRenameItem}
                view={view}
                gridSize={gridSize}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Folder not found.</p>
              </div>
            )}
          </main>
        </div>
      </SidebarInset>
      <Dialog open={isCreateFolderOpen} onOpenChange={setCreateFolderOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="col-span-3"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" onClick={handleCreateFolder}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
