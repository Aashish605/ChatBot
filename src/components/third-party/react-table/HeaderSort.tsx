// material-ui
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';

// third-party
import { Column } from '@tanstack/react-table';

// assets
import CaretDownOutlined from '@ant-design/icons/CaretDownOutlined';
import CaretUpOutlined from '@ant-design/icons/CaretUpOutlined';

enum SortType {
  ASC = 'asc',
  DESC = 'desc'
}

function SortToggler({ type }: { type?: SortType }) {
  return (
    <Stack
      sx={{
        fontSize: '0.625rem',
        color: 'secondary.light',
        ...(type === SortType.ASC && { '& .caret-up': { color: 'secondary.main' } }),
        ...(type === SortType.DESC && { '& .caret-down': { color: 'secondary.main' } })
      }}
    >
      <CaretUpOutlined className="caret-up" />
      <CaretDownOutlined className="caret-down" style={{ marginTop: -2 }} />
    </Stack>
  );
}

interface HeaderSortProps<T extends object> {
  column: Column<T, unknown>;
  sort?: boolean;
}

// ==============================|| HEADER SORT ||============================== //

export default function HeaderSort<T extends object>({ column, sort = true }: HeaderSortProps<T>) {
  return (
    <Box {...(sort && { onClick: column.getToggleSortingHandler(), sx: { cursor: 'pointer' } })}>
      {{
        asc: <SortToggler type={SortType.ASC} />,
        desc: <SortToggler type={SortType.DESC} />
      }[column.getIsSorted() as string] ?? <SortToggler />}
    </Box>
  );
}
