import { ChangeEvent, SyntheticEvent } from 'react';
import { TableCellProps } from '@mui/material/TableCell';
import { KeyedObject } from './root';

export type ArrangementOrder = 'asc' | 'desc' | undefined;

export type GetComparator = (o: ArrangementOrder, o1: string) => (a: KeyedObject, b: KeyedObject) => number;

export interface EnhancedTableHeadProps extends TableCellProps {
  onSelectAllClick: (e: ChangeEvent<HTMLInputElement>) => void;
  order: ArrangementOrder;
  orderBy?: string;
  numSelected: number;
  rowCount: number;
  onRequestSort: (e: SyntheticEvent, p: string) => void;
}

export interface HeadCell {
  id: string;
  numeric: boolean;
  label: string;
  disablePadding?: string | boolean | undefined;
  align?: 'left' | 'right' | 'inherit' | 'center' | 'justify' | undefined;
}

export interface KnowledgeBaseStep {
  text: string;
}

export interface TableDataProps {
  id: number;                                // ✅ required by DnD and getRowId
  type: string;
  title: string;
  question: string;
  answer: string;
  content: string;
  category: string;
  tags: string[];
  keywords: string[];
  common_user_phrases: string[];
  steps: KnowledgeBaseStep[];
  priority: number;
  visibility: 'public' | 'private';
  is_active: boolean;
}