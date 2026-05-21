import { Fragment, useMemo } from 'react';

// material-ui
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// third-party
import { flexRender, useReactTable, ColumnDef, getExpandedRowModel, getCoreRowModel } from '@tanstack/react-table';
import { LabelKeyObject } from 'react-csv/lib/core';

// project imports
import ExpandingUserDetail from './ExpandingUserDetail';
import MainCard from 'components/MainCard';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import { CSVExport, StatusPill } from 'components/third-party/react-table';
import makeData from 'data/react-table';
import { withAlpha } from 'utils/colorUtils';

// types
import { TableDataProps } from 'types/table';

// assets
import DownOutlined from '@ant-design/icons/DownOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';
import StopOutlined from '@ant-design/icons/StopOutlined';

// ==============================|| REACT TABLE ||============================== //

interface ReactTableProps {
  columns: ColumnDef<TableDataProps>[];
  data: TableDataProps[];
}

function ReactTable({ columns, data }: ReactTableProps) {
  const table = useReactTable({
    data,
    columns,
    getRowCanExpand: () => true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel()
  });

  const headers = useMemo<LabelKeyObject[]>(
    () =>
      table.getAllColumns().map((column) => ({
        label: typeof column.columnDef.header === 'string' ? column.columnDef.header : '#',
        key: (column.columnDef as { accessorKey?: string }).accessorKey ?? ''
      })),
    [table]
  );

  return (
    <MainCard
      title="Expanding User Details"
      content={false}
      secondary={<CSVExport {...{ data, headers, filename: 'expanding-details.csv' }} />}
    >
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
              <Fragment key={row.id}>
                <TableRow>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
                {row.getIsExpanded() && (
                  <TableRow
                    sx={(theme) => ({
                      bgcolor: withAlpha(theme.vars.palette.primary.lighter, 0.1),
                      '&:hover': { bgcolor: `${withAlpha(theme.vars.palette.primary.lighter, 0.1)} !important` }
                    })}
                  >
                    <TableCell colSpan={row.getVisibleCells().length}>
                      <ExpandingUserDetail data={row.original} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
}

// ==============================|| REACT TABLE - EXPANDING USER DETAILS ||============================== //

export default function ExpandingDetails() {
  const data: TableDataProps[] = makeData(10);

  const columns = useMemo<ColumnDef<TableDataProps>[]>(
    () => [
      {
        id: 'expander',
        header: () => null,
        cell: ({ row }) => {
          return row.getCanExpand() ? (
            <IconButton color={row.getIsExpanded() ? 'primary' : 'secondary'} onClick={row.getToggleExpandedHandler()} size="small">
              {row.getIsExpanded() ? <DownOutlined /> : <RightOutlined />}
            </IconButton>
          ) : (
            <IconButton color="secondary" size="small" disabled>
              <StopOutlined />
            </IconButton>
          );
        },
        meta: { sx: { width: 58 } }
      },
      { header: 'Name', accessorKey: 'fullName', meta: { sx: { whiteSpace: 'nowrap' } } },
      { header: 'Email', accessorKey: 'email' },
      { header: 'Age', accessorKey: 'age', meta: { align: 'right' } },
      { header: 'Status', accessorKey: 'status', cell: (cell) => <StatusPill status={cell.getValue() as string} /> },
      {
        header: 'Profile Progress',
        accessorKey: 'progress',
        cell: (cell) => <LinearWithLabel value={cell.getValue() as number} sx={{ minWidth: 75 }} />
      }
    ],
    []
  );

  return <ReactTable {...{ columns, data }} />;
}
