import { SetStateAction } from 'react';

// material-ui
import Checkbox from '@mui/material/Checkbox';
import FormControl, { FormControlProps } from '@mui/material/FormControl';
import { InputBaseProps } from '@mui/material/InputBase';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectProps } from '@mui/material/Select';
import Typography from '@mui/material/Typography';

// third-party
import { Column, SortingState, TableState } from '@tanstack/react-table';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 200
    }
  }
};

interface Props<T extends object> {
  getState: () => TableState;
  setSorting: (value: SetStateAction<SortingState>) => void;
  getAllColumns: () => Column<T, unknown>[];
  size?: InputBaseProps['size'];
  sx?: SelectProps['sx'];
  formControlProps?: FormControlProps;
}

// ==============================|| COLUMN SORTING - SELECT ||============================== //

export default function SelectColumnSorting<T extends object>({
  getState,
  getAllColumns,
  setSorting,
  size = 'medium',
  formControlProps
}: Props<T>) {
  return (
    <FormControl {...formControlProps} sx={{ width: 200, ...formControlProps?.sx }}>
      <Select
        id="column-sorting"
        multiple
        displayEmpty
        value={getState().sorting.length > 0 ? getState().sorting : []}
        input={<OutlinedInput id="select-column-sorting" placeholder="select column" />}
        renderValue={(selected) => {
          const selectedColumn = getAllColumns().find((column) => selected.length > 0 && column.id === selected[0].id);
          if (selectedColumn) {
            return (
              <Typography variant="subtitle2">
                Sort by ({typeof selectedColumn.columnDef.header === 'string' ? selectedColumn.columnDef.header : '#'})
              </Typography>
            );
          }
          return <Typography variant="subtitle2">Sort By</Typography>;
        }}
        MenuProps={MenuProps}
        size={size}
      >
        {getAllColumns().map(
          (column) =>
            'header' in column.columnDef &&
            column.getCanSort() && (
              <MenuItem
                key={column.id}
                value={column.id}
                onClick={() =>
                  setSorting(
                    getState().sorting.length > 0 && column.id === getState().sorting[0].id ? [] : [{ id: column.id, desc: false }]
                  )
                }
              >
                <Checkbox checked={getState().sorting.length > 0 && column.id === getState().sorting[0].id} color="success" />
                <ListItemText primary={column.columnDef.header as string} />
              </MenuItem>
            )
        )}
      </Select>
    </FormControl>
  );
}
