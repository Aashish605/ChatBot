// material-ui
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';

// third-party
import { Column, ColumnDefTemplate, HeaderContext, RowData, Table } from '@tanstack/react-table';

// project imports
import DebouncedInput from './DebouncedInput';

// assets
import MinusOutlined from '@ant-design/icons/MinusOutlined';

interface NumberInputProps {
  columnFilterValue: [number, number];
  getFacetedMinMaxValues: () => [number, number] | undefined;

  setFilterValue: (updater: any) => void;
}

const filterStyle = { fontSize: 12 };

// ==============================|| FILTER - NUMBER FIELD ||============================== //

function NumberInput({ columnFilterValue, getFacetedMinMaxValues, setFilterValue }: NumberInputProps) {
  const minOpt = getFacetedMinMaxValues()?.[0];
  const min = Number(minOpt ?? '');

  const maxOpt = getFacetedMinMaxValues()?.[1];
  const max = Number(maxOpt || 0);

  return (
    <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
      <DebouncedInput
        type="number"
        value={columnFilterValue?.[0] ?? ''}
        onFilterChange={(value) => setFilterValue((old: [number, number]) => [value, old?.[1]])}
        placeholder={`Min ${minOpt ? `(${min})` : ''}`}
        fullWidth
        slotProps={{ input: { min: min, max: max, sx: { p: 1 } } }}
        startIcon={false}
        sx={filterStyle}
      />
      <MinusOutlined color="disabled" />
      <DebouncedInput
        type="number"
        value={columnFilterValue?.[1] ?? ''}
        onFilterChange={(value) => setFilterValue((old: [number, number]) => [old?.[0], value])}
        placeholder={`Max ${maxOpt ? `(${max})` : ''}`}
        fullWidth
        slotProps={{ input: { min: min, max: max, sx: { p: 1 } } }}
        startIcon={false}
        sx={filterStyle}
      />
    </Stack>
  );
}

interface TextInputProps {
  columnId: string;
  columnFilterValue: string;
  setFilterValue: (updater: string | number) => void;
  header?: string;
}

// ==============================|| FILTER - TEXT FIELD ||============================== //

function TextInput({ columnId, columnFilterValue, header, setFilterValue }: TextInputProps) {
  const dataListId = columnId + 'list';

  return (
    <DebouncedInput
      type="text"
      fullWidth
      value={columnFilterValue ?? ''}
      onFilterChange={(value) => setFilterValue(value)}
      placeholder={`Search ${header}`}
      slotProps={{ input: { list: dataListId, sx: { p: 1 } } }}
      startIcon={false}
      sx={filterStyle}
    />
  );
}

interface FilterColumnMeta {
  filtertype?: 'text' | 'number' | 'slider' | 'select';
  options?: string[];
}

interface Props<T extends RowData> {
  column: Column<T, unknown> & { columnDef: { meta?: FilterColumnMeta; header?: string | ColumnDefTemplate<HeaderContext<T, unknown>> } };
  table: Table<T>;
}

// ==============================|| FILTER - INPUT ||============================== //

export default function Filter<T extends RowData>({ column }: Props<T>) {
  const columnFilterValue = column.getFilterValue();
  const colMeta = column.columnDef.meta?.filtertype;

  switch (colMeta) {
    case 'number':
      return (
        <NumberInput
          columnFilterValue={columnFilterValue as [number, number]}
          getFacetedMinMaxValues={column.getFacetedMinMaxValues}
          setFilterValue={column.setFilterValue}
        />
      );

    case 'slider': {
      const [facetedMin, facetedMax] = column.getFacetedMinMaxValues() ?? [0, 100];
      return (
        <Slider
          size="medium"
          min={0}
          max={100}
          value={Array.isArray(columnFilterValue) ? columnFilterValue : [facetedMin, facetedMax]}
          onChange={(_, value) => column.setFilterValue(value as number[])}
          valueLabelDisplay="auto"
          sx={{ width: 150 }}
        />
      );
    }

    case 'select': {
      const options = Array.from(column.getFacetedUniqueValues().keys());

      return (
        <Select size="small" value={columnFilterValue ?? ''} onChange={(e) => column.setFilterValue(e.target.value)} displayEmpty fullWidth>
          <MenuItem value="" sx={{ textTransform: 'none' }}>
            All
          </MenuItem>
          {options.map((opt) => (
            <MenuItem key={opt} value={opt} sx={{ textTransform: 'none' }}>
              {opt}
            </MenuItem>
          ))}
        </Select>
      );
    }

    default:
      return (
        <TextInput
          columnId={column.id}
          columnFilterValue={columnFilterValue as string}
          setFilterValue={column.setFilterValue}
          header={column.columnDef.header as string}
        />
      );
  }
}
