import { useMemo } from 'react';

// material-ui
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// third-party
import { flexRender, useReactTable, ColumnDef, getCoreRowModel } from '@tanstack/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';

// project imports
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import MainCard from 'components/MainCard';
import { CSVExport, StatusPill } from 'components/third-party/react-table';
import makeData from 'data/react-table';

// types
import { TableDataProps } from 'types/table';

interface ReactTableProps {
  columns: ColumnDef<TableDataProps>[];
  data: TableDataProps[];
  striped?: boolean;
  footer?: boolean;
  title?: string;
}

// ==============================|| REACT TABLE ||============================== //

function ReactTable({ columns, data, title, striped, footer }: ReactTableProps) {
  const table = useReactTable({
    data,
    columns,
    state: { columnVisibility: !footer ? { visits: false, role: false } : {} },
    getCoreRowModel: getCoreRowModel()
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
    <MainCard content={false} title={title} secondary={<CSVExport {...{ data, headers, filename: 'data.csv' }} />}>
      <TableContainer>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id} {...header.column.columnDef.meta}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} sx={{ ...(striped && { '&:nth-of-type(even)': { bgcolor: 'action.hover' } }) }}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          {footer && (
            <TableFooter>
              {table.getFooterGroups().map((footerGroup) => (
                <TableRow key={footerGroup.id}>
                  {footerGroup.headers.map((footer) => (
                    <TableCell key={footer.id} {...footer.column.columnDef.meta}>
                      {footer.isPlaceholder ? null : flexRender(footer.column.columnDef.header, footer.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableFooter>
          )}
        </Table>
      </TableContainer>
    </MainCard>
  );
}

// ==============================|| REACT TABLE - BASIC ||============================== //

export default function BasicTable({ title, striped, footer = false }: { title?: string; striped?: boolean; footer?: boolean }) {
  const data: TableDataProps[] = makeData(10);

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      { header: 'Name', accessorKey: 'fullName', meta: { sx: { whiteSpace: 'nowrap' } } },
      { header: 'Email', accessorKey: 'email' },
      { header: 'Age', accessorKey: 'age', meta: { align: 'right' } },
      { header: 'Role', footer: 'Role', accessorKey: 'role' },
      { header: 'Visits', accessorKey: 'visits', meta: { align: 'right' } },
      { header: 'Status', accessorKey: 'status', cell: (cell) => <StatusPill status={cell.getValue() as string} /> },
      {
        header: 'Profile Progress',
        accessorKey: 'progress',
        cell: (cell) => <LinearWithLabel value={cell.getValue() as number} sx={{ minWidth: 75 }} />
      }
    ],

    []
  );

  return <ReactTable {...{ data, columns, title, striped, footer }} />;
}
