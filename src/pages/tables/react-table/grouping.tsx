import { useMemo, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// project imports
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import MainCard from 'components/MainCard';
import { CSVExport, StatusPill } from 'components/third-party/react-table';
import makeData from 'data/react-table';

// assets
import DownOutlined from '@ant-design/icons/DownOutlined';
import GroupOutlined from '@ant-design/icons/GroupOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';
import UngroupOutlined from '@ant-design/icons/UngroupOutlined';

// types
import { TableDataProps } from 'types/table';

import {
  GroupingState,
  useReactTable,
  getCoreRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  ColumnDef,
  flexRender
} from '@tanstack/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';

// ==============================|| REACT TABLE - GROUPING ||============================== //

export default function Grouping() {
  const theme = useTheme();

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      { header: 'Name', accessorKey: 'fullName', enableGrouping: false, meta: { sx: { whiteSpace: 'nowrap' } } },
      { header: 'Email', accessorKey: 'email', enableGrouping: false },
      { header: 'Age', accessorKey: 'age', meta: { align: 'right' } },
      { header: 'Visits', accessorKey: 'visits', enableGrouping: false, meta: { align: 'right' } },
      { header: 'Status', accessorKey: 'status', cell: (cell) => <StatusPill status={cell.getValue() as string} /> },
      {
        header: 'Profile Progress',
        accessorKey: 'progress',
        cell: (cell) => <LinearWithLabel value={cell.getValue() as number} sx={{ minWidth: 75 }} />,
        enableGrouping: false
      }
    ],
    []
  );

  const [data] = useState(() => makeData(100));

  const [grouping, setGrouping] = useState<GroupingState>(['age']);

  const table = useReactTable({
    data,
    columns,
    state: { grouping },
    onGroupingChange: setGrouping,
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    debugTable: true
  });

  const headers: LabelKeyObject[] = [];

  table.getAllColumns().map((column) => {
    const accessorKey = (column.columnDef as { accessorKey?: string }).accessorKey;
    headers.push({
      label: typeof column.columnDef.header === 'string' ? column.columnDef.header : '#',
      key: accessorKey ?? ''
    });
  });

  return (
    <MainCard
      content={false}
      title="Grouping"
      secondary={<CSVExport {...{ data: table.getGroupedRowModel().rows.map((row) => row.original), headers, filename: 'grouping.csv' }} />}
    >
      <TableContainer sx={{ height: 575 }}>
        <Table stickyHeader>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableCell key={header.id} {...header.column.columnDef.meta}>
                      {header.isPlaceholder ? null : (
                        <>
                          {header.column.getCanGroup() && (
                            // If the header can be grouped, let's add a toggle
                            <IconButton
                              color={header.column.getIsGrouped() ? 'error' : 'primary'}
                              onClick={header.column.getToggleGroupingHandler()}
                              size="small"
                              sx={{ p: 0, width: 24, height: 24, fontSize: '1rem', mr: 0.75 }}
                            >
                              {header.column.getIsGrouped() ? <UngroupOutlined /> : <GroupOutlined />}
                            </IconButton>
                          )}
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => {
              return (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <TableCell
                        key={cell.id}
                        {...{
                          style: {
                            background: cell.getIsGrouped()
                              ? theme.vars.palette.primary.lighter
                              : cell.getIsAggregated()
                                ? theme.vars.palette.warning.lighter
                                : cell.getIsPlaceholder()
                                  ? theme.vars.palette.error.lighter
                                  : theme.vars.palette.background.paper
                          }
                        }}
                        {...cell.column.columnDef.meta}
                      >
                        {cell.getIsGrouped() ? (
                          // If it's a grouped cell, add an expander and row count
                          <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
                            <IconButton onClick={row.getToggleExpandedHandler()} size="small" sx={{ p: 0, width: 24, height: 24 }}>
                              {row.getIsExpanded() ? <DownOutlined /> : <RightOutlined />}
                            </IconButton>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}&nbsp;({row.subRows.length})
                          </Stack>
                        ) : cell.getIsAggregated() ? (
                          // If the cell is aggregated, use the Aggregated
                          // renderer for cell
                          flexRender(cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell, cell.getContext())
                        ) : cell.getIsPlaceholder() ? null : ( // For cells with repeated values, render null
                          // Otherwise, just render the regular cell
                          flexRender(cell.column.columnDef.cell, cell.getContext())
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
}
