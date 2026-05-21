import { CSSProperties, Fragment, ReactNode, useEffect, useMemo, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Box from '@mui/material/Box';

// third-party
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  type UniqueIdentifier,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { restrictToHorizontalAxis, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { arrayMove, SortableContext, horizontalListSortingStrategy, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { compareItems, rankItem, RankingInfo } from '@tanstack/match-sorter-utils';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getPaginationRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  flexRender,
  useReactTable,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  GroupingState,
  FilterFn,
  SortingFn,
  sortingFns,
  Header,
  Row
} from '@tanstack/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';

// project imports
import MainCard from 'components/MainCard';
import {
  CSVExport,
  DebouncedInput,
  EmptyTable,
  EditRow,
  Filter,
  HeaderSort,
  IndeterminateCheckbox,
  RowSelection,
  TablePagination,
  SelectColumnVisibility
} from 'components/third-party/react-table';

import makeData from 'data/react-table';
import ExpandingUserDetail from 'sections/tables/react-table/ExpandingUserDetail';

// types
import { TableDataProps } from 'types/table';

// assets
import DownOutlined from '@ant-design/icons/DownOutlined';
import DragOutlined from '@ant-design/icons/DragOutlined';
import GroupOutlined from '@ant-design/icons/GroupOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';
import StopOutlined from '@ant-design/icons/StopOutlined';
import UngroupOutlined from '@ant-design/icons/UngroupOutlined';

const fuzzyFilter: FilterFn<TableDataProps> = (row, columnId, value, addMeta) => {
  // rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // store the ranking info
  addMeta(itemRank);

  // return if the item should be filtered in/out
  return itemRank.passed;
};

const fuzzySort: SortingFn<TableDataProps> = (rowA, rowB, columnId) => {
  let dir = 0;

  // only sort by rank if the column has ranking information
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(rowA.columnFiltersMeta[columnId]! as RankingInfo, rowB.columnFiltersMeta[columnId]! as RankingInfo);
  }

  // provide an alphanumeric fallback for when the item ranks are equal
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

const nonOrderableColumnId: UniqueIdentifier[] = ['drag-handle', 'expander', 'select'];

// ==============================|| REACT TABLE - DRAGGABLE HEADER ||============================== //

function DraggableTableCell({ header }: { header: Header<TableDataProps, unknown> }) {
  const { attributes, isDragging, listeners, setNodeRef, transform } = useSortable({
    id: header.column.id
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.7 : 1,
    position: 'relative',
    transform: CSS.Translate.toString(transform),
    transition: 'width transform 0.2s ease-in-out',
    whiteSpace: 'nowrap',
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0
  };

  return (
    <TableCell colSpan={header.colSpan} ref={setNodeRef} style={style} {...header.column.columnDef.meta}>
      {header.isPlaceholder ? null : (
        <Stack direction="row" sx={{ gap: 1, alignItems: 'center' }}>
          {header.column.getCanGroup() && (
            <IconButton
              color={header.column.getIsGrouped() ? 'error' : 'primary'}
              onClick={header.column.getToggleGroupingHandler()}
              size="small"
              sx={{ p: 0, width: 24, height: 24, fontSize: '1rem', mr: 0.75 }}
            >
              {header.column.getIsGrouped() ? <UngroupOutlined /> : <GroupOutlined />}
            </IconButton>
          )}
          <Box
            {...(!nonOrderableColumnId.includes(header.id) && {
              ...attributes,
              ...listeners,
              sx: { cursor: isDragging ? 'grabbing' : 'grab' }
            })}
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
          </Box>
          {header.column.getCanSort() && <HeaderSort column={header.column} sort />}
        </Stack>
      )}
    </TableCell>
  );
}

// ==============================|| REACT TABLE - DRAGGABLE ROW ||============================== //

function DraggableRow({ children, row, groupedColumns }: { children: ReactNode; row: Row<TableDataProps>; groupedColumns: string[] }) {
  const { transform, transition, setNodeRef, isDragging, attributes, listeners, setActivatorNodeRef } = useSortable({
    id: row.original.id
  });

  const nonEditableCells = row.getVisibleCells().filter((cell) => nonOrderableColumnId.includes(cell.column.id));

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative'
  };

  const isGrouped = groupedColumns.length > 0;

  return (
    <TableRow ref={setNodeRef} style={style}>
      {isGrouped && <TableCell colSpan={groupedColumns.length} sx={{ bgcolor: 'error.lighter' }} />}
      {nonEditableCells.map((cell) => {
        if (cell.column.id === 'drag-handle') {
          if (!isGrouped) {
            return (
              <TableCell key={cell.id} sx={{ width: 58 }}>
                <IconButton
                  {...attributes}
                  {...listeners}
                  ref={setActivatorNodeRef}
                  size="small"
                  color="secondary"
                  sx={{ p: 0, width: 24, height: 24, fontSize: '1rem', cursor: isDragging ? 'grabbing' : 'grab' }}
                >
                  <DragOutlined />
                </IconButton>
              </TableCell>
            );
          } else {
            return null;
          }
        }

        return (
          <TableCell key={cell.id} {...cell.column.columnDef.meta}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        );
      })}
      {children}
    </TableRow>
  );
}

// ==============================|| REACT TABLE - EXPANDER BUTTON ||============================== //

function ExpanderButton({ row }: { row: Row<TableDataProps> }) {
  return (
    <IconButton color={row.getIsExpanded() ? 'primary' : 'secondary'} onClick={row.getToggleExpandedHandler()} size="small">
      {row.getIsExpanded() ? <DownOutlined /> : <RightOutlined />}
    </IconButton>
  );
}

// ==============================|| REACT TABLE - UMBRELLA ||============================== //

export default function UmbrellaTable() {
  const theme = useTheme();

  const columns = useMemo<ColumnDef<TableDataProps, unknown>[]>(
    () => [
      { id: 'drag-handle', size: 60 },
      {
        id: 'expander',
        enableGrouping: false,
        header: () => null,
        cell: ({ row }) => {
          return row.getCanExpand() ? (
            <ExpanderButton row={row} />
          ) : (
            <IconButton color="secondary" size="small" disabled>
              <StopOutlined />
            </IconButton>
          );
        },
        size: 60
      },
      {
        id: 'select',
        enableGrouping: false,
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        ),
        size: 60
      },
      {
        id: 'id',
        title: 'Id',
        header: '#',
        accessorKey: 'id',
        enableColumnFilter: false,
        enableGrouping: false,
        meta: { align: 'center' }
      },
      {
        id: 'avatar',
        header: 'Avatar',
        accessorKey: 'avatar',
        enableColumnFilter: false,
        enableGrouping: false,
        dataType: 'avatar',
        meta: { align: 'center' }
      },
      { id: 'fullName', header: 'Name', footer: 'Name', accessorKey: 'fullName', dataType: 'text', enableGrouping: false },
      { id: 'email', header: 'Email', footer: 'Email', accessorKey: 'email', dataType: 'text', enableGrouping: false },
      {
        id: 'age',
        header: 'Age',
        footer: 'Age',
        accessorKey: 'age',
        dataType: 'number',
        meta: { align: 'right' },
        enableGrouping: true
      },
      {
        id: 'role',
        header: 'Role',
        footer: 'Role',
        accessorKey: 'role',
        dataType: 'text',
        enableGrouping: true,
        filterFn: fuzzyFilter,
        sortingFn: fuzzySort
      },
      { id: 'contact', header: 'Contact', footer: 'Contact', accessorKey: 'contact', dataType: 'text', enableGrouping: false },
      { id: 'country', header: 'Country', footer: 'Country', accessorKey: 'country', dataType: 'text', enableGrouping: false },
      {
        id: 'visits',
        header: 'Visits',
        footer: 'Visits',
        accessorKey: 'visits',
        dataType: 'text',
        enableGrouping: false,
        meta: { align: 'right' }
      },
      { id: 'status', header: 'Status', footer: 'Status', accessorKey: 'status', dataType: 'select', enableGrouping: true },
      {
        id: 'progress',
        header: 'Profile Progress',
        footer: 'Profile Progress',
        accessorKey: 'progress',
        dataType: 'progress',
        enableGrouping: false
      },
      {
        id: 'actions',
        header: 'Actions',
        dataType: 'actions',
        meta: { align: 'center' }
      }
    ],
    []
  );

  const [data, setData] = useState(() => makeData(100));
  const [columnOrder, setColumnOrder] = useState<string[]>(() => columns.map((c) => c.id!));
  const dataIds = useMemo<UniqueIdentifier[]>(() => data?.map(({ id }: TableDataProps) => id), [data]);

  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [grouping, setGrouping] = useState<GroupingState>([]);

  const [columnVisibility, setColumnVisibility] = useState({});
  const [statusFilter, setStatusFilter] = useState<string>('');

  const filteredData = useMemo(() => {
    if (!statusFilter) return data;
    return data.filter((user: TableDataProps) => user.status === statusFilter);
  }, [statusFilter, data]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getRowId: (row) => row.id.toString(),
    state: { rowSelection, columnFilters, globalFilter, sorting, grouping, columnOrder, columnVisibility },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGroupingChange: setGrouping,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    getRowCanExpand: () => true,
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    globalFilterFn: fuzzyFilter,
    debugTable: true,
    debugHeaders: true,
    debugColumns: true
  });

  const headers: LabelKeyObject[] = [];
  table.getVisibleLeafColumns().map((column) => {
    const accessorKey = (column.columnDef as { accessorKey?: string }).accessorKey;
    headers.push({
      label: typeof column.columnDef.header === 'string' ? column.columnDef.header : '#',
      key: accessorKey ?? ''
    });
  });

  // Handle Column Drag End
  function handleColumnDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      if (nonOrderableColumnId.includes(over.id)) return;
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex);
      });
    }
  }

  // Handle Row Drag End
  function handleRowDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data: unknown[]) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  const columnSensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));
  const rowSensors = useSensors(useSensor(MouseSensor, {}), useSensor(TouchSensor, {}), useSensor(KeyboardSensor, {}));
  const groupedColumns = table.getState().grouping;

  useEffect(() => setColumnVisibility({ id: false, role: false, contact: false, country: false, progress: false }), []);

  const filteredColumns = table.getAllColumns().filter((col) => !nonOrderableColumnId.includes(col.id));

  // Ensure utility columns are visible whenever any data column is visible
  useEffect(() => {
    const anyDataColumnVisible = filteredColumns.some((col) => col.getIsVisible?.());
    if (!anyDataColumnVisible) return;

    const anyUtilityHidden = nonOrderableColumnId.some((utilityId) => table.getColumn(String(utilityId))?.getIsVisible?.() === false);
    if (!anyUtilityHidden) return;

    setColumnVisibility((prev: Record<string, boolean>) => {
      const next: Record<string, boolean> = { ...prev };
      nonOrderableColumnId.forEach((utilityId) => {
        next[utilityId as string] = true;
      });
      return next;
    });
  }, [columnVisibility, filteredColumns, table]);

  return (
    <MainCard content={false}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={(theme) => ({
          gap: 2,
          p: 2,
          justifyContent: 'space-between',
          [theme.breakpoints.down('sm')]: { '& .MuiOutlinedInput-root, & .MuiFormControl-root': { width: 1 } }
        })}
      >
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Search ${data.length} records...`}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ alignItems: 'center', gap: 2, width: { xs: 1, sm: 'auto' } }}>
          <Select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            displayEmpty
            size="small"
            input={<OutlinedInput />}
            slotProps={{ input: { 'aria-label': 'Status Filter' } }}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="Single">Single</MenuItem>
            <MenuItem value="Relationship">Relationship</MenuItem>
            <MenuItem value="Complicated">Complicated</MenuItem>
          </Select>
          <Stack sx={{ alignItems: 'flex-end' }}>
            <RowSelection selected={Object.keys(rowSelection).length} />
            <Stack direction="row" sx={{ gap: 2, alignItems: 'center', width: { xs: 1, sm: 'auto' } }}>
              <SelectColumnVisibility
                {...{
                  getVisibleLeafColumns: () => table.getVisibleLeafColumns().filter((col) => !nonOrderableColumnId.includes(col.id)),
                  getIsAllColumnsVisible: () => filteredColumns.every((col) => col.getIsVisible?.()),
                  getToggleAllColumnsVisibilityHandler: table.getToggleAllColumnsVisibilityHandler,
                  getAllColumns: () => filteredColumns
                }}
              />
              <CSVExport
                {...{
                  data:
                    table.getSelectedRowModel().flatRows.map((row) => row.original).length === 0
                      ? data
                      : table.getSelectedRowModel().flatRows.map((row) => row.original),
                  headers,
                  filename: 'umbrella.csv'
                }}
              />
            </Stack>
          </Stack>
        </Stack>
      </Stack>

      {/* Column DnD Context */}
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={handleColumnDragEnd}
        sensors={columnSensors}
      >
        <TableContainer>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <SortableContext items={columnOrder} strategy={horizontalListSortingStrategy}>
                    {headerGroup.headers.map((header) => {
                      // hide drag-handle column if table is grouped
                      if (groupedColumns.length > 0 && header.column.id === 'drag-handle') return null;

                      return <DraggableTableCell key={header.id} header={header} />;
                    })}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHead>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    // hide drag-handle column if table is grouped
                    if (groupedColumns.length > 0 && header.column.id === 'drag-handle') return null;

                    return (
                      <TableCell key={header.id} {...header.column.columnDef.meta}>
                        {header.column.getCanFilter() && <Filter column={header.column} table={table} />}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {/* Row DnD Context */}
              <DndContext
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleRowDragEnd}
                sensors={rowSensors}
              >
                {table.getRowModel().rows.length > 0 ? (
                  <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                    {table.getRowModel().rows.map((row) => {
                      if (row.getIsGrouped()) {
                        return (
                          <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell) => {
                              // hide drag-handle column if table is grouped
                              if (groupedColumns.length > 0 && cell.column.id === 'drag-handle') return null;

                              const bgcolor = cell.getIsGrouped()
                                ? theme.vars.palette.primary.lighter
                                : cell.getIsAggregated()
                                  ? theme.vars.palette.warning.lighter
                                  : cell.getIsPlaceholder()
                                    ? theme.vars.palette.error.lighter
                                    : theme.vars.palette.background.paper;
                              return (
                                <TableCell key={cell.id} {...cell.column.columnDef.meta} style={{ background: bgcolor }}>
                                  {cell.getIsGrouped() ? (
                                    <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
                                      <ExpanderButton row={row} />
                                      {cell.getValue() as ReactNode}&nbsp;({row.subRows.length})
                                    </Stack>
                                  ) : cell.getIsAggregated() ? (
                                    flexRender(cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell, cell.getContext())
                                  ) : cell.getIsPlaceholder() ? null : (
                                    flexRender(cell.column.columnDef.cell, cell.getContext())
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      } else {
                        return (
                          <Fragment key={row.id}>
                            <DraggableRow row={row} groupedColumns={groupedColumns}>
                              <EditRow
                                row={row}
                                onSave={(updatedData) => {
                                  setData((prev: TableDataProps[]) =>
                                    prev.map((item: TableDataProps) => (item.id === row.original.id ? { ...item, ...updatedData } : item))
                                  );
                                }}
                                groupedColumns={groupedColumns}
                              />
                            </DraggableRow>
                            {row.getIsExpanded() && !row.getIsGrouped() && (
                              <TableRow key={`${row.id}-expanded`}>
                                <TableCell colSpan={table.getAllLeafColumns().length} sx={{ bgcolor: 'background.default', p: 3 }}>
                                  <ExpandingUserDetail data={row.original} />
                                </TableCell>
                              </TableRow>
                            )}
                          </Fragment>
                        );
                      }
                    })}
                  </SortableContext>
                ) : (
                  <TableRow sx={{ '&.MuiTableRow-root:hover': { bgcolor: 'transparent' } }}>
                    <TableCell colSpan={table.getAllColumns().length}>
                      <EmptyTable msg="No Data" />
                    </TableCell>
                  </TableRow>
                )}
              </DndContext>
            </TableBody>
            <TableFooter>
              {table.getFooterGroups().map((footerGroup) => (
                <TableRow key={footerGroup.id}>
                  {footerGroup.headers.map((footer) => {
                    // hide drag-handle column if table is grouped
                    if (groupedColumns.length > 0 && footer.column.id === 'drag-handle') return null;

                    return (
                      <TableCell key={footer.id} {...footer.column.columnDef.meta}>
                        {footer.isPlaceholder ? null : flexRender(footer.column.columnDef.header, footer.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableFooter>
          </Table>
        </TableContainer>
      </DndContext>
      <Divider />
      <Box sx={{ p: 2 }}>
        <TablePagination
          {...{
            setPageSize: table.setPageSize,
            setPageIndex: table.setPageIndex,
            getState: table.getState,
            getPageCount: table.getPageCount
          }}
        />
      </Box>
    </MainCard>
  );
}
