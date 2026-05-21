// material-ui
import Stack from '@mui/material/Stack';

// project imports
import RowDragDrop from 'sections/tables/react-table/RowDragDrop';
import ColumnDragDrop from 'sections/tables/react-table/ColumnDragDrop';

// ==============================|| REACT TABLE - DRAG & DROP ||============================== //

export default function DragDrop() {
  return (
    <Stack sx={{ gap: 3 }}>
      <RowDragDrop />
      <ColumnDragDrop />
    </Stack>
  );
}
