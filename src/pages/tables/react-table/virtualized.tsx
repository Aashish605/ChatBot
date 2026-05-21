// material-ui
import Stack from '@mui/material/Stack';

// project imports
import VirtualizedInfiniteScrollTable from 'sections/tables/react-table/VirtualizedInfiniteScrollTable';
import VirtualizedRowsTable from 'sections/tables/react-table/VirtualizedRowsTable';

// ==============================|| REACT TABLE - VIRTUALIZED ||============================== //

export default function VirtualizedRows() {
  return (
    <Stack sx={{ gap: 3 }}>
      <VirtualizedInfiniteScrollTable />
      <VirtualizedRowsTable />
    </Stack>
  );
}
