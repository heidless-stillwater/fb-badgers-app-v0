'use client';

import React, { useState } from 'react';
import {
  Folder as FolderType,
  File as FileType,
  FileSystemItem,
} from '../lib/data';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
  } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Folder, MoreVertical, FilePenLine, Trash2, Download } from 'lucide-react';
import { FileIcon } from './file-icon';
import { useToast } from '@/hooks/use-toast';
import { ClientDate } from './client-date';

interface FileBrowserProps {
  folder: FolderType;
  breadcrumbs: FolderType[];
  onNavigate: (folderId: string) => void;
  onDeleteItem: (itemId: string, itemName: string) => void;
  onRenameItem: (itemId: string, newName: string) => void;
}

const FileBrowser: React.FC<FileBrowserProps> = ({
  folder,
  breadcrumbs,
  onNavigate,
  onDeleteItem,
  onRenameItem,
}) => {
  const [itemToDelete, setItemToDelete] = useState<FileSystemItem | null>(null);
  const [itemToRename, setItemToRename] = useState<FileSystemItem | null>(null);
  const [newName, setNewName] = useState('');
  const { toast } = useToast();

  const folders = folder.children.filter(
    (item) => item.type === 'folder'
  ) as FolderType[];
  const files = folder.children.filter(
    (item) => item.type === 'file'
  ) as FileType[];

  const handleRenameSubmit = () => {
    if (itemToRename && newName.trim()) {
        onRenameItem(itemToRename.id, newName.trim());
        setItemToRename(null);
        setNewName('');
    }
  }

  const handleDownload = (file: FileType) => {
    const blob = new Blob([file.content || ''], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
        title: 'Download Started',
        description: `Downloading "${file.name}"...`
    });
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((b, index) => (
            <React.Fragment key={b.id}>
              <BreadcrumbItem>
                {index === breadcrumbs.length - 1 ? (
                  <BreadcrumbPage className="font-semibold">{b.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <button onClick={() => onNavigate(b.id)} className="hover:underline">{b.name}</button>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h2 className="text-xl font-semibold mb-4">Folders</h2>
        {folders.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {folders.map((f) => (
              <Card
                key={f.id}
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onDoubleClick={() => onNavigate(f.id)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2" onClick={() => onNavigate(f.id)}>
                    <Folder className="h-6 w-6 text-accent" />
                    <CardTitle className="text-base font-medium truncate">{f.name}</CardTitle>
                  </div>
                  <ItemActions item={f} onRename={setItemToRename} onDelete={setItemToDelete} />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No folders here.</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Files</h2>
        <Card>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[80px]">Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {files.length > 0 ? (
                files.map((file) => (
                    <TableRow key={file.id}>
                    <TableCell>
                        <FileIcon filename={file.name} className="h-6 w-6" />
                    </TableCell>
                    <TableCell className="font-medium">{file.name}</TableCell>
                    <TableCell>{file.size}</TableCell>
                    <TableCell>
                        <ClientDate date={file.modified} format="PPp" fallback={<span>...</span>} />
                    </TableCell>
                    <TableCell className="text-right">
                        <ItemActions item={file} onRename={setItemToRename} onDelete={setItemToDelete} onDownload={handleDownload}/>
                    </TableCell>
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                    No files here.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </Card>
      </div>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              item named "{itemToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
                if(itemToDelete) onDeleteItem(itemToDelete.id, itemToDelete.name);
            }}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!itemToRename} onOpenChange={(open) => !open && setItemToRename(null)}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Rename "{itemToRename?.name}"</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name-rename" className="text-right">
                    New Name
                </Label>
                <Input
                    id="name-rename"
                    defaultValue={itemToRename?.name}
                    onChange={(e) => setNewName(e.target.value)}
                    className="col-span-3"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
                />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit" onClick={handleRenameSubmit}>Save changes</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ItemActionsProps {
    item: FileSystemItem;
    onRename: (item: FileSystemItem) => void;
    onDelete: (item: FileSystemItem) => void;
    onDownload?: (item: FileType) => void;
}

const ItemActions: React.FC<ItemActionsProps> = ({ item, onRename, onDelete, onDownload }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {item.type === 'file' && onDownload && (
                    <DropdownMenuItem onClick={() => onDownload(item as FileType)}>
                        <Download className="mr-2 h-4 w-4" />
                        <span>Download</span>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onRename(item)}>
                    <FilePenLine className="mr-2 h-4 w-4" />
                    <span>Rename</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(item)} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default FileBrowser;
