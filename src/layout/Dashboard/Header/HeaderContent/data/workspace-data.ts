export type LabelType = 'Free' | 'Pro';

export interface DataItem {
  id: number;
  title: string;
  image: string;
  label?: LabelType;
}

export const workspaceData: DataItem[] = [
  {
    id: 1,
    title: 'Acme Corp',
    image: 'bag.svg',
    label: 'Free'
  },
  {
    id: 2,
    title: 'Globex Inc.',
    image: 'global.svg',
    label: 'Pro'
  },
  {
    id: 3,
    title: 'Stellar Labs',
    image: 'lab.svg'
  }
];
