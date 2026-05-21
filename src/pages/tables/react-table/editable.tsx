// material-ui
import Stack from '@mui/material/Stack';

// project imports
import EditableCell from 'sections/tables/react-table/EditableCell';
import EditableRow from 'sections/tables/react-table/EditableRow';

// ==============================|| REACT TABLE - EDITABLE ||============================== //

export default function EditableTable() {
  return (
    <Stack sx={{ gap: 3 }}>
      <EditableRow />
      <EditableCell />
    </Stack>
  );
}
