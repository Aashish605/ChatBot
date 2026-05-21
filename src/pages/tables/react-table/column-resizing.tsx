import { useMemo } from 'react';

// material-ui
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// third-party
import { flexRender, useReactTable, ColumnDef, getCoreRowModel } from '@tanstack/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';

// project imports
import MainCard from 'components/MainCard';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import { CSVExport, StatusPill } from 'components/third-party/react-table';
import makeData from 'data/react-table';

// types
import { TableDataProps } from 'types/table';

// assets
import MinusOutlined from '@ant-design/icons/MinusOutlined';

interface ReactTableProps {
  columns: ColumnDef<TableDataProps>[];
  data: TableDataProps[];
}

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data }: ReactTableProps) {
  const table = useReactTable({
    data,
    columns,
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: true
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
    <MainCard content={false} title="Column Resizing" secondary={<CSVExport {...{ data, headers, filename: 'column-resizing.csv' }} />}>
      <TableContainer>
        <Table sx={{ width: table.getCenterTotalSize() }}>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    {...header.column.columnDef.meta}
                    sx={{
                      position: 'relative',
                      '&:not(:last-of-type)': {
                        backgroundImage: (theme) => `linear-gradient(${theme.vars.palette.divider}, ${theme.vars.palette.divider})`
                      },
                      '&:hover:not(:last-of-type)': {
                        backgroundSize: '2px calc(100% - 30px)',
                        backgroundImage: (theme) =>
                          `linear-gradient(${theme.vars.palette.primary.main}, ${theme.vars.palette.primary.main})`
                      }
                    }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    <Stack
                      direction="row"
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      sx={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        height: 1,
                        width: 5,
                        cursor: 'col-resize',
                        userSelect: 'none',
                        touchAction: 'none',
                        opacity: 0,
                        zIndex: 1
                      }}
                    >
                      <MinusOutlined style={{ transform: 'rotate(90deg)' }} />
                    </Stack>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} {...cell.column.columnDef.meta} style={{ width: cell.column.getSize() }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
}

// ==============================|| REACT TABLE - COLUMN RESIZING ||============================== //

export default function ColumnResizing() {
  const data: TableDataProps[] = makeData(15);

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      { header: '#', accessorKey: 'id', meta: { align: 'center' } },
      { header: 'Name', accessorKey: 'fullName' },
      { header: 'Email', accessorKey: 'email' },
      { header: 'Age', accessorKey: 'age', meta: { align: 'right' } },
      { header: 'Role', accessorKey: 'role' },
      { header: 'Contact', accessorKey: 'contact' },
      { header: 'Country', accessorKey: 'country' },
      { header: 'Visits', accessorKey: 'visits', meta: { align: 'right' } },
      { header: 'Status', accessorKey: 'status', cell: (cell) => <StatusPill status={cell.getValue() as string} /> },
      {
        header: 'Progress',
        accessorKey: 'progress',
        cell: (cell) => <LinearWithLabel value={cell.getValue() as number} sx={{ minWidth: 100 }} />
      }
    ],
    []
  );

  return <ReactTable {...{ columns, data }} />;
}
