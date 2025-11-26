export interface File {
  id: string;
  name: string;
  size: string;
  modified: Date;
  type: 'file';
}

export interface Folder {
  id: string;
  name: string;
  type: 'folder';
  children: FileSystemItem[];
}

export type FileSystemItem = File | Folder;

export const initialFileSystem: Folder = {
  id: 'root',
  name: 'My Drive',
  type: 'folder',
  children: [
    {
      id: 'folder-1',
      name: 'Documents',
      type: 'folder',
      children: [
        {
          id: 'file-1-1',
          name: 'Project Proposal.docx',
          size: '2.3 MB',
          modified: new Date('2023-10-01T10:00:00Z'),
          type: 'file',
        },
        {
          id: 'file-1-2',
          name: 'Financials.xlsx',
          size: '800 KB',
          modified: new Date('2023-09-15T14:30:00Z'),
          type: 'file',
        },
      ],
    },
    {
      id: 'folder-2',
      name: 'Photos',
      type: 'folder',
      children: [
        {
          id: 'folder-2-1',
          name: 'Vacation 2023',
          type: 'folder',
          children: [
            {
              id: 'file-2-1-1',
              name: 'beach-sunset.jpg',
              size: '4.5 MB',
              modified: new Date('2023-07-20T19:45:00Z'),
              type: 'file',
            },
            {
              id: 'file-2-1-2',
              name: 'mountain-hike.png',
              size: '6.1 MB',
              modified: new Date('2023-07-22T11:20:00Z'),
              type: 'file',
            },
          ],
        },
        {
          id: 'file-2-2',
          name: 'profile-pic.jpeg',
          size: '1.2 MB',
          modified: new Date('2023-05-10T08:00:00Z'),
          type: 'file',
        },
      ],
    },
    {
      id: 'folder-3',
      name: 'Work',
      type: 'folder',
      children: [],
    },
    {
      id: 'file-1',
      name: 'random-notes.txt',
      size: '12 KB',
      modified: new Date('2023-11-05T12:00:00Z'),
      type: 'file',
    },
    {
      id: 'file-2',
      name: 'app-wireframe.svg',
      size: '45 KB',
      modified: new Date('2023-11-02T16:00:00Z'),
      type: 'file',
    },
    {
      id: 'file-3',
      name: 'meeting-recording.mp4',
      size: '128 MB',
      modified: new Date('2023-10-28T09:00:00Z'),
      type: 'file',
    },
  ],
};
