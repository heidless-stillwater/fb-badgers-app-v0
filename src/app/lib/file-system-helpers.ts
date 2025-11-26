import type { Folder, FileSystemItem } from './data';

function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj), (key, value) => {
    if (key === 'modified' && typeof value === 'string') {
      return new Date(value);
    }
    return value;
  });
}

export function findFolder(root: Folder, folderId: string): Folder | null {
  if (root.id === folderId) {
    return root;
  }
  for (const item of root.children) {
    if (item.type === 'folder') {
      const found = findFolder(item, folderId);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export function findParent(root: Folder, itemId: string): Folder | null {
  for (const item of root.children) {
    if (item.id === itemId) {
      return root;
    }
    if (item.type === 'folder') {
      const found = findParent(item, itemId);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export function addToFileSystem(
  root: Folder,
  parentId: string,
  item: FileSystemItem
): Folder {
  const newRoot = clone(root);
  const parentFolder = findFolder(newRoot, parentId);

  if (parentFolder) {
    // Check for duplicate names
    const existing = parentFolder.children.find(child => child.name === item.name && child.type === item.type);
    if (existing) {
        // Simple name conflict resolution by appending a number
        let i = 1;
        let newName = `${item.name.split('.')[0]} (${i})`;
        const extension = item.name.split('.').pop();
        if (item.type === 'file' && extension && item.name.includes('.')) {
            newName = `${item.name.substring(0, item.name.lastIndexOf('.'))} (${i}).${extension}`;
        } else {
             newName = `${item.name} (${i})`;
        }

        while(parentFolder.children.find(child => child.name === newName)){
            i++;
            if (item.type === 'file' && extension && item.name.includes('.')) {
                newName = `${item.name.substring(0, item.name.lastIndexOf('.'))} (${i}).${extension}`;
            } else {
                 newName = `${item.name} (${i})`;
            }
        }
        item.name = newName;
    }
    parentFolder.children.push(item);
    parentFolder.children.sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
  }

  return newRoot;
}

export function removeFromFileSystem(root: Folder, itemId: string): Folder {
  const newRoot = clone(root);

  function recursiveRemove(currentFolder: Folder, id: string): boolean {
    const index = currentFolder.children.findIndex((item) => item.id === id);
    if (index !== -1) {
      currentFolder.children.splice(index, 1);
      return true;
    }
    for (const item of currentFolder.children) {
      if (item.type === 'folder') {
        if (recursiveRemove(item, id)) {
          return true;
        }
      }
    }
    return false;
  }

  recursiveRemove(newRoot, itemId);

  return newRoot;
}

export function renameInFileSystem(
  root: Folder,
  itemId: string,
  newName: string
): Folder {
  const newRoot = clone(root);

  function findAndRename(currentFolder: Folder, id: string, name: string): boolean {
    const item = currentFolder.children.find((child) => child.id === id);
    if (item) {
      item.name = name;
      return true;
    }
    for (const child of currentFolder.children) {
      if (child.type === 'folder') {
        if (findAndRename(child, id, name)) {
          return true;
        }
      }
    }
    return false;
  }

  findAndRename(newRoot, itemId, newName);
  return newRoot;
}
