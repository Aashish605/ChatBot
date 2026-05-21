import { ReactNode, useState } from 'react';

// material-ui
import { useColorScheme, useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';

// third-party
import { UniqueIdentifier } from '@dnd-kit/core';
import { useFormik } from 'formik';
import { Row } from '@tanstack/react-table';
import * as Yup from 'yup';

// project imports
import { ThemeMode } from 'config';
import LinearWithLabel from 'components/@extended/progress/LinearWithLabel';
import Avatar from 'components/@extended/Avatar';
import { StatusPill } from 'components/third-party/react-table';
import { withAlpha } from 'utils/colorUtils';
import { getImageUrl, ImagePath } from 'utils/getImageUrl';

// types
import { KnowledgeBaseStep, TableDataProps } from 'types/table';  // 👈 add this

// assets
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import DeleteOutlined from '@ant-design/icons/DeleteOutlined';    // 👈 add this
import EditTwoTone from '@ant-design/icons/EditTwoTone';
import SendOutlined from '@ant-design/icons/SendOutlined';

interface EditRowProps<TData> {
  row: Row<TData>;
  onSave: (updatedData: Record<string, unknown>) => void;
  groupedColumns?: string[];
}

const nonEditableFields: UniqueIdentifier[] = ['drag-handle', 'expander', 'select'];

// ==============================|| STEPS EDITOR COMPONENT ||============================== //
// 👇 Add this entire component above EditRow

function StepsEditor({
  row,
  onChange
}: {
  row: Row<TableDataProps>;
  onChange: (value: unknown) => void;
}) {
  const [localSteps, setLocalSteps] = useState<KnowledgeBaseStep[]>(
    (row.original as TableDataProps).steps ?? []
  );

  const handleStepChange = (index: number, text: string) => {
    const updated = localSteps.map((s, i) => (i === index ? { text } : s));
    setLocalSteps(updated);
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    const updated = localSteps.filter((_, i) => i !== index);
    setLocalSteps(updated);
    onChange(updated);
  };

  const handleAdd = () => {
    const updated = [...localSteps, { text: '' }];
    setLocalSteps(updated);
    onChange(updated);
  };

  return (
    <Stack spacing={1} sx={{ minWidth: 240 }}>
      {localSteps.map((step, index) => (
        <Stack key={index} direction="row" spacing={1} alignItems="center">
          <OutlinedInput
            size="small"
            fullWidth
            value={step.text}
            onChange={(e) => handleStepChange(index, e.target.value)}
            placeholder={`Step ${index + 1}`}
            slotProps={{ input: { sx: { py: 0.75 } } }}
          />
          <IconButton size="small" color="error" onClick={() => handleDelete(index)}>
            <DeleteOutlined />
          </IconButton>
        </Stack>
      ))}
      <Button size="small" variant="outlined" onClick={handleAdd}>
        + Add Step
      </Button>
    </Stack>
  );
}

// ==============================|| YUP SCHEMA ||============================== //

function getYupSchemaForRow<TData>(row: Row<TData>) {
  const shape: Record<string, any> = {};
  const skipValidation = ['drag-handle', 'expander', 'select', 'actions', 'steps']; // 👈 add 'steps' here
  row.getVisibleCells().forEach((cell) => {
    const columnId = cell.column.id;
    if (skipValidation.includes(columnId)) {
      return;
    }
    switch (columnId) {
      case 'title':
        shape[columnId] = Yup.string()
          .test('trim', 'Title cannot be empty', (value) => !!value && value.trim().length > 0)
          .required('Title is required');
        break;
      case 'type':
        shape[columnId] = Yup.string().required('Type is required');
        break;
      case 'category':
        shape[columnId] = Yup.string().required('Category is required');
        break;
      case 'question':
        shape[columnId] = Yup.string().required('Question is required');
        break;
      case 'answer':
        shape[columnId] = Yup.string().required('Answer is required');
        break;
      case 'content':
        shape[columnId] = Yup.string().required('Content is required');
        break;
      case 'tags':
        shape[columnId] = Yup.string().required('Tags are required');
        break;
      case 'keywords':
        shape[columnId] = Yup.string().required('Keywords are required');
        break;
      case 'common_user_phrases':
        shape[columnId] = Yup.string().required('Common phrases are required');
        break;
      case 'priority':
        shape[columnId] = Yup.number()
          .typeError('Priority must be a number')
          .required('Priority is required')
          .min(1, 'Minimum priority is 1')
          .max(10, 'Maximum priority is 10');
        break;
      case 'visibility':
        shape[columnId] = Yup.string()
          .oneOf(['public', 'private'], 'Must be public or private')
          .required('Visibility is required');
        break;
      case 'is_active':
        shape[columnId] = Yup.boolean().required('Active status is required');
        break;
      default:
        shape[columnId] = Yup.string().required('This field is required');
        break;
    }
  });
  return Yup.object().shape(shape);
}

// ==============================|| EDITABLE ROW ||============================== //

export default function EditRow<TData>({ row, onSave, groupedColumns }: EditRowProps<TData>) {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();

  const [isEditMode, setEditMode] = useState(false);

  function getRowData<TData>(row: Row<TData>) {
    return row.getVisibleCells().reduce(
      (acc, cell) => {
        if (cell.column.id !== 'Actions') {
          acc[cell.column.id] = cell.getValue();
        }
        return acc;
      },
      {} as Record<string, unknown>
    );
  }

  const editableFields = row.getVisibleCells().filter((cell) => !nonEditableFields.includes(cell.column.id));

  const formik = useFormik({
    initialValues: getRowData(row),
    enableReinitialize: true,
    validationSchema: getYupSchemaForRow(row),
    onSubmit: (values, actions) => {
      // 👇 merge steps from row.original since accessorFn stringifies them
      const stepsValue = (row.original as TableDataProps).steps;
      onSave({ ...values, steps: stepsValue });
      setEditMode(false);
      actions.setSubmitting(false);
    }
  });
  const { values, errors, handleChange } = formik;

  const handleEditClick = () => {
    formik.resetForm({ values: getRowData(row) });
    setEditMode(true);
  };

  const handleCancelClick = () => {
    formik.resetForm({ values: getRowData(row) });
    setEditMode(false);
  };

  const handleEditDataChange = (columnId: string, value: unknown) => {
    formik.setFieldValue(columnId, value);
  };

  return (
    <>
      {editableFields.map((cell) => {
        const dataType = (cell.column.columnDef as any).dataType;
        const columnId = cell.column.id;
        const value = cell.getValue();

        if (groupedColumns && groupedColumns.includes(columnId)) {
          return null;
        }

        let cellContent;
        switch (dataType) {
          case 'avatar':
            cellContent = (
              <Avatar
                alt="Avatar"
                size="sm"
                src={getImageUrl(`avatar-${value}.png`, ImagePath.USERS)}
                sx={{ m: 'auto' }}
              />
            );
            break;

          case 'number':
          case 'text':
            cellContent = isEditMode ? (
              <TextField
                fullWidth
                variant="outlined"
                name={columnId}
                value={values[columnId]}
                onChange={(e) => {
                  handleChange(e);
                  const val = e.target.value;
                  handleEditDataChange(
                    columnId,
                    dataType === 'number' && val !== '' && !isNaN(Number(val)) ? Number(val) : val
                  );
                }}
                onBlur={(e) => {
                  const trimmed = (e.target.value ?? '').trim();
                  if (trimmed !== formik.values[columnId]) {
                    formik.setFieldValue(columnId, trimmed, false);
                  }
                }}
                error={!!errors[columnId]}
                helperText={errors[columnId]}
                slotProps={{ htmlInput: { sx: { py: 0.75 } } }}
                sx={{ '& .MuiFormHelperText-root': { mx: 0 } }}
              />
            ) : (
              value
            );
            break;

          case 'select':
            // 👇 handle both status and visibility and is_active selects
            cellContent = isEditMode ? (
              columnId === 'visibility' ? (
                <Select
                  value={values[columnId]}
                  onChange={(e) => handleEditDataChange(columnId, e.target.value)}
                  size="small"
                  slotProps={{ input: { sx: { py: 0.5 } } }}
                >
                  <MenuItem value="public">
                    <Chip color="success" label="Public" size="small" variant="light" />
                  </MenuItem>
                  <MenuItem value="private">
                    <Chip color="error" label="Private" size="small" variant="light" />
                  </MenuItem>
                </Select>
              ) : columnId === 'is_active' ? (
                <Select
                  value={String(values[columnId])}
                  onChange={(e) => handleEditDataChange(columnId, e.target.value === 'true')}
                  size="small"
                  slotProps={{ input: { sx: { py: 0.5 } } }}
                >
                  <MenuItem value="true">
                    <Chip color="success" label="Yes" size="small" variant="light" />
                  </MenuItem>
                  <MenuItem value="false">
                    <Chip color="error" label="No" size="small" variant="light" />
                  </MenuItem>
                </Select>
              ) : (
                <Select
                  value={values[columnId]}
                  onChange={(e) => handleEditDataChange(columnId, e.target.value)}
                  size="small"
                  slotProps={{ input: { sx: { py: 0.5 } } }}
                >
                  <MenuItem value="Complicated">
                    <Chip color="error" label="Complicated" size="small" variant="light" />
                  </MenuItem>
                  <MenuItem value="Relationship">
                    <Chip color="success" label="Relationship" size="small" variant="light" />
                  </MenuItem>
                  <MenuItem value="Single">
                    <Chip color="info" label="Single" size="small" variant="light" />
                  </MenuItem>
                </Select>
              )
            ) : (
              <StatusPill status={String(value)} />
            );
            break;

          case 'progress':
            cellContent = isEditMode ? (
              <Stack direction="row" sx={{ alignItems: 'center', pl: 1, minWidth: 120 }}>
                <Slider
                  value={values[columnId] as number}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(_, newValue) => handleEditDataChange(columnId, newValue)}
                  valueLabelDisplay="auto"
                  aria-labelledby="non-linear-slider"
                />
              </Stack>
            ) : (
              <LinearWithLabel value={value as number} sx={{ minWidth: 75 }} />
            );
            break;

          // 👇 ADD THIS NEW CASE
          case 'steps':
            cellContent = isEditMode ? (
              <StepsEditor
                row={row as unknown as Row<TableDataProps>}
                onChange={(updated) => handleEditDataChange(columnId, updated)}
              />
            ) : (
              <span>
                {((row.original as TableDataProps).steps ?? []).length > 0
                  ? (row.original as TableDataProps).steps.map((s, i) => (
                      <span key={i} style={{ display: 'block', fontSize: '0.75rem' }}>
                        {i + 1}. {s.text}
                      </span>
                    ))
                  : '—'}
              </span>
            );
            break;

          case 'actions':
            cellContent = isEditMode ? (
              <Stack direction="row" sx={{ gap: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Tooltip title="Cancel">
                  <IconButton color="error" onClick={handleCancelClick}>
                    <CloseOutlined />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Save">
                  <IconButton color="success" type="submit" onClick={formik.submitForm}>
                    <SendOutlined />
                  </IconButton>
                </Tooltip>
              </Stack>
            ) : (
              <Tooltip title="Edit">
                <IconButton color="primary" onClick={handleEditClick}>
                  <EditTwoTone
                    twoToneColor={[
                      theme.palette.primary.main,
                      colorScheme === ThemeMode.DARK
                        ? withAlpha(theme.palette.primary.darker, 0.5)
                        : ''
                    ]}
                  />
                </IconButton>
              </Tooltip>
            );
            break;

          default:
            cellContent = value;
        }

        return (
          <TableCell key={cell.id} {...cell.column.columnDef.meta}>
            {cellContent as ReactNode}
          </TableCell>
        );
      })}
    </>
  );
}