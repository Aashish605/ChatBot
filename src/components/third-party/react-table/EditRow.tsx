// User clicks Copy icon (EditRow.tsx)
//   → onDuplicate(row.original) fires
//     → handleDuplicate(row) in useKnowledgeBaseTable.ts
//       → duplicateKnowledgeBaseRow(row) in knowledgeBaseApi.ts
//         → strips id from row
//         → appends "(Copy)" to title
//         → INSERT into Supabase
//           → returns new row with new id
//       → splice new row into local state after original
//         → table re-renders with duplicate below original
//           → showToast("Row duplicated successfully")



import { ReactNode, createContext, useContext, useState } from "react";

import { useColorScheme, useTheme } from "@mui/material/styles";

import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  OutlinedInput,
  Select,
  Slider,
  Stack,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  CloseOutlined,
  DeleteOutlined,
  EditTwoTone,
  SendOutlined,
  CopyOutlined,
} from "@ant-design/icons";

import { UniqueIdentifier } from "@dnd-kit/core";
import { useFormik, FormikProps } from "formik";
import { Row } from "@tanstack/react-table";
import * as Yup from "yup";

import { ThemeMode } from "config";
import LinearWithLabel from "components/@extended/progress/LinearWithLabel";
import Avatar from "components/@extended/Avatar";
import { StatusPill } from "components/third-party/react-table";
import { withAlpha } from "utils/colorUtils";
import { getImageUrl, ImagePath } from "utils/getImageUrl";

import { KnowledgeBaseStep, TableDataProps } from "types/table";

import { arrayToInput } from "utils/knowledgeBaseTransform"; // add this import

const ARRAY_FIELDS = ["tags", "keywords", "common_user_phrases"];

interface EditRowProps<TData> {
  row: Row<TData>;
  onSave: (updatedData: Record<string, unknown>) => void;
  groupedColumns?: string[];
}

interface RowEditProviderProps<TData> {
  row: Row<TData>;
  onSave: (updatedData: Record<string, unknown>) => void;
  onDelete: (id: number) => void;
  onDuplicate: (row: TableDataProps) => void;
  hiddenColumnIds?: string[];
  children: ReactNode;
}

interface EditRowCellsProps {
  groupedColumns?: string[];
}

interface EditRowExpandedRowProps {
  colSpan: number;
  hiddenColumnIds: string[];
  columnLabels: Record<string, string>;
}

const nonEditableFields: UniqueIdentifier[] = [
  "drag-handle",
  "expander",
  "select",
];

const COLUMN_LABELS: Record<string, string> = {
  question: "Question",
  tags: "Tags",
  priority: "Priority",
  visibility: "Visibility",
  answer: "Answer",
  content: "Content",
  keywords: "Keywords",
  common_user_phrases: "Common Phrases",
  steps: "Steps",
  is_active: "Active",
};

const COLUMN_DATA_TYPES: Record<string, string> = {
  question: "text",
  tags: "text",
  priority: "number",
  visibility: "select",
  answer: "text",
  content: "text",
  keywords: "text",
  common_user_phrases: "text",
  steps: "steps",
  is_active: "select",
};

type RowEditContextValue = {
  row: Row<TableDataProps>;
  formik: FormikProps<Record<string, unknown>>;
  isEditMode: boolean;
  handleEditClick: () => void;
  handleCancelClick: () => void;
  handleEditDataChange: (columnId: string, value: unknown) => void;
  onDelete: (id: number) => void;
  onDuplicate: (row: TableDataProps) => void;
};

const RowEditContext = createContext<RowEditContextValue | null>(null);

const useRowEdit = () => {
  const context = useContext(RowEditContext);
  if (!context) {
    throw new Error("useRowEdit must be used within RowEditProvider");
  }
  return context;
};

function StepsEditor({
  row,
  onChange,
}: {
  row: Row<TableDataProps>;
  onChange: (value: unknown) => void;
}) {
  const [localSteps, setLocalSteps] = useState<KnowledgeBaseStep[]>(
    row.original.steps ?? [],
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
    const updated = [...localSteps, { text: "" }];
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
          <IconButton
            size="small"
            color="error"
            onClick={() => handleDelete(index)}
          >
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

const getYupFieldSchema = (columnId: string) => {
  switch (columnId) {
    case "title":
      return Yup.string()
        .test(
          "trim",
          "Title cannot be empty",
          (value) => !!value && value.trim().length > 0,
        )
        .required("Title is required");
    case "type":
      return Yup.string().required("Type is required");
    case "category":
      return Yup.string().required("Category is required");
    case "question":
      return Yup.string().required("Question is required");
    case "answer":
      return Yup.string().required("Answer is required");
    case "content":
      return Yup.string().required("Content is required");
    case "tags":
      return Yup.string().required("Tags are required");
    case "keywords":
      return Yup.string().required("Keywords are required");
    case "common_user_phrases":
      return Yup.string().required("Common phrases are required");
    case "priority":
      return Yup.number()
        .typeError("Priority must be a number")
        .required("Priority is required")
        .min(1, "Minimum priority is 1")
        .max(10, "Maximum priority is 10");
    case "visibility":
      return Yup.string()
        .oneOf(["public", "private"], "Must be public or private")
        .required("Visibility is required");
    case "is_active":
      return Yup.boolean().required("Active status is required");
    default:
      return Yup.string().required("This field is required");
  }
};

const getYupSchemaForFields = (fieldIds: string[]) => {
  const shape: Record<string, Yup.AnySchema> = {};
  const skipValidation = [
    "drag-handle",
    "expander",
    "select",
    "actions",
    "steps",
  ];
  fieldIds.forEach((columnId) => {
    if (skipValidation.includes(columnId)) return;
    shape[columnId] = getYupFieldSchema(columnId);
  });
  return Yup.object().shape(shape);
};

const getRowData = <TData,>(
  row: Row<TData>,
  fieldIds: string[],
): Record<string, unknown> =>
  fieldIds.reduce(
    (acc, columnId) => {
      if (columnId === "steps") {
        acc[columnId] = (row.original as TableDataProps).steps ?? [];
        return acc;
      }
      const cell = row
        .getAllCells()
        .find((item) => item.column.id === columnId);
      const rawValue =
        cell?.getValue() ?? (row.original as Record<string, unknown>)[columnId];

      acc[columnId] =
        ARRAY_FIELDS.includes(columnId) && Array.isArray(rawValue)
          ? arrayToInput(rawValue as string[])
          : rawValue;

      return acc;
    },
    {} as Record<string, unknown>,
  );

const renderEditableField = ({
  columnId,
  dataType,
  value,
  isEditMode,
  values,
  errors,
  handleChange,
  handleEditDataChange,
  formik,
  row,
}: {
  columnId: string;
  dataType?: string;
  value: unknown;
  isEditMode: boolean;
  values: Record<string, unknown>;
  errors: Record<string, unknown>;
  handleChange: FormikProps<Record<string, unknown>>["handleChange"];
  handleEditDataChange: (columnId: string, value: unknown) => void;
  formik: FormikProps<Record<string, unknown>>;
  row: Row<TableDataProps>;
}) => {
  switch (dataType) {
    case "avatar":
      return (
        <Avatar
          alt="Avatar"
          size="sm"
          src={getImageUrl(`avatar-${value}.png`, ImagePath.USERS)}
          sx={{ m: "auto" }}
        />
      );

    case "number":
    case "text":
      return isEditMode ? (
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
              dataType === "number" && val !== "" && !isNaN(Number(val))
                ? Number(val)
                : val,
            );
          }}
          onBlur={(e) => {
            const trimmed = (e.target.value ?? "").trim();
            if (trimmed !== formik.values[columnId]) {
              formik.setFieldValue(columnId, trimmed, false);
            }
          }}
          error={!!errors[columnId]}
          helperText={errors[columnId] as string}
          slotProps={{ htmlInput: { sx: { py: 0.75 } } }}
          sx={{ "& .MuiFormHelperText-root": { mx: 0 } }}
        />
      ) : (
        (value as ReactNode)
      );

    case "select":
      return isEditMode ? (
        columnId === "visibility" ? (
          <Select
            value={values[columnId]}
            onChange={(e) => handleEditDataChange(columnId, e.target.value)}
            size="small"
            fullWidth
            slotProps={{ input: { sx: { py: 0.5 } } }}
          >
            <MenuItem value="public">
              <Chip
                color="success"
                label="Public"
                size="small"
                variant="light"
              />
            </MenuItem>
            <MenuItem value="private">
              <Chip
                color="error"
                label="Private"
                size="small"
                variant="light"
              />
            </MenuItem>
          </Select>
        ) : columnId === "is_active" ? (
          <Select
            value={String(values[columnId])}
            onChange={(e) =>
              handleEditDataChange(columnId, e.target.value === "true")
            }
            size="small"
            fullWidth
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
            fullWidth
            slotProps={{ input: { sx: { py: 0.5 } } }}
          >
            <MenuItem value="Complicated">
              <Chip
                color="error"
                label="Complicated"
                size="small"
                variant="light"
              />
            </MenuItem>
            <MenuItem value="Relationship">
              <Chip
                color="success"
                label="Relationship"
                size="small"
                variant="light"
              />
            </MenuItem>
            <MenuItem value="Single">
              <Chip color="info" label="Single" size="small" variant="light" />
            </MenuItem>
          </Select>
        )
      ) : (
        <StatusPill status={String(value)} />
      );

    case "progress":
      return isEditMode ? (
        <Stack
          direction="row"
          sx={{ alignItems: "center", pl: 1, minWidth: 120 }}
        >
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

    case "steps":
      return isEditMode ? (
        <StepsEditor
          row={row}
          onChange={(updated) => handleEditDataChange(columnId, updated)}
        />
      ) : (
        <span>
          {(row.original.steps ?? []).length > 0
            ? row.original.steps.map((s, i) => (
                <span key={i} style={{ display: "block", fontSize: "0.75rem" }}>
                  {i + 1}. {s.text}
                </span>
              ))
            : "—"}
        </span>
      );

    default:
      return value as ReactNode;
  }
};

export const RowEditProvider = <TData,>({
  row,
  onSave,
  onDelete,
  onDuplicate,
  hiddenColumnIds = [],
  children,
}: RowEditProviderProps<TData>) => {
  const typedRow = row as unknown as Row<TableDataProps>;
  const visibleFieldIds = row
    .getVisibleCells()
    .map((cell) => cell.column.id)
    .filter((id) => !nonEditableFields.includes(id) && id !== "actions");
  const allFieldIds = [...visibleFieldIds, ...hiddenColumnIds];

  const [isEditMode, setEditMode] = useState(false);

  const formik = useFormik({
    initialValues: getRowData(typedRow, allFieldIds),
    enableReinitialize: true,
    validationSchema: getYupSchemaForFields(allFieldIds),
    onSubmit: (values, actions) => {
      onSave(values);
      setEditMode(false);
      actions.setSubmitting(false);
    },
  });

  const handleEditClick = () => {
    formik.resetForm({ values: getRowData(typedRow, allFieldIds) });
    setEditMode(true);
  };

  const handleCancelClick = () => {
    formik.resetForm({ values: getRowData(typedRow, allFieldIds) });
    setEditMode(false);
  };

  const handleEditDataChange = (columnId: string, value: unknown) => {
    formik.setFieldValue(columnId, value);
  };

  return (
    <RowEditContext.Provider
      value={{
        row: typedRow,
        formik,
        isEditMode,
        handleEditClick,
        handleCancelClick,
        handleEditDataChange,
        onDelete,
        onDuplicate,
      }}
    >
      {children}
    </RowEditContext.Provider>
  );
};

export const EditRowCells = ({ groupedColumns }: EditRowCellsProps) => {
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const {
    row,
    formik,
    isEditMode,
    handleEditClick,
    handleCancelClick,
    handleEditDataChange,
    onDelete,
    onDuplicate,
  } = useRowEdit();
  const { values, errors, handleChange } = formik;

  const editableFields = row
    .getVisibleCells()
    .filter((cell) => !nonEditableFields.includes(cell.column.id));

  return (
    <>
      {editableFields.map((cell) => {
        const dataType = (cell.column.columnDef as { dataType?: string })
          .dataType;
        const columnId = cell.column.id;
        const value = cell.getValue();

        if (groupedColumns?.includes(columnId)) return null;

        if (dataType === "actions") {
          return (
            <TableCell key={cell.id} {...cell.column.columnDef.meta}>
              {isEditMode ? (
                <Stack
                  direction="row"
                  sx={{
                    gap: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Tooltip title="Cancel">
                    <IconButton color="error" onClick={handleCancelClick}>
                      <CloseOutlined />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Save">
                    <IconButton
                      color="success"
                      type="submit"
                      onClick={formik.submitForm}
                    >
                      <SendOutlined />
                    </IconButton>
                  </Tooltip>
                </Stack>
              ) : (
                <Stack
                  direction="row"
                  sx={{
                    gap: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Tooltip title="Edit">
                    <IconButton color="primary" onClick={handleEditClick}>
                      <EditTwoTone
                        twoToneColor={[
                          theme.palette.primary.main,
                          colorScheme === ThemeMode.DARK
                            ? withAlpha(theme.palette.primary.darker, 0.5)
                            : "",
                        ]}
                      />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Duplicate">
                    <IconButton
                      color="info"
                      onClick={() => onDuplicate(row.original)}
                    >
                      <CopyOutlined />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete">
                    <IconButton
                      color="error"
                      onClick={() => onDelete(row.original.id)}
                    >
                      <DeleteOutlined />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}
            </TableCell>
          );
        }

        return (
          <TableCell key={cell.id} {...cell.column.columnDef.meta}>
            {renderEditableField({
              columnId,
              dataType,
              value,
              isEditMode,
              values,
              errors,
              handleChange,
              handleEditDataChange,
              formik,
              row,
            })}
          </TableCell>
        );
      })}
    </>
  );
};

export const EditRowExpandedRow = ({
  colSpan,
  hiddenColumnIds,
  columnLabels,
}: EditRowExpandedRowProps) => {
  const { row, formik, isEditMode, handleEditDataChange } = useRowEdit();
  const { values, errors, handleChange } = formik;

  if (!isEditMode || hiddenColumnIds.length === 0) return null;

  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        sx={{ bgcolor: "background.default", py: 2 }}
      >
        <Typography variant="subtitle2" sx={{ mb: 2 }}>
          Additional fields
        </Typography>
        <Grid container spacing={2}>
          {hiddenColumnIds.map((columnId) => {
            const column = row
              .getAllCells()
              .find((cell) => cell.column.id === columnId)?.column;
            const dataType =
              (column?.columnDef as { dataType?: string })?.dataType ??
              COLUMN_DATA_TYPES[columnId];
            const value =
              columnId === "steps"
                ? row.original.steps
                : row.original[columnId as keyof TableDataProps];

            return (
              <Grid key={columnId} size={{ xs: 12, sm: 6, md: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  {columnLabels[columnId] ??
                    COLUMN_LABELS[columnId] ??
                    columnId}
                </Typography>
                <Box sx={{ mt: 0.75 }}>
                  {renderEditableField({
                    columnId,
                    dataType,
                    value,
                    isEditMode: true,
                    values,
                    errors,
                    handleChange,
                    handleEditDataChange,
                    formik,
                    row,
                  })}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </TableCell>
    </TableRow>
  );
};

export default function EditRow<TData>({
  row,
  onSave,
  groupedColumns,
}: EditRowProps<TData>) {
  const typedRow = row as unknown as Row<TableDataProps>;
  const theme = useTheme();
  const { colorScheme } = useColorScheme();
  const [isEditMode, setEditMode] = useState(false);

  const editableFields = row
    .getVisibleCells()
    .filter((cell) => !nonEditableFields.includes(cell.column.id));

  const fieldIds = editableFields
    .map((cell) => cell.column.id)
    .filter((id) => id !== "actions");

  const formik = useFormik({
    initialValues: getRowData(typedRow, fieldIds),
    enableReinitialize: true,
    validationSchema: getYupSchemaForFields(fieldIds),
    onSubmit: (values, actions) => {
      onSave(values);
      setEditMode(false);
      actions.setSubmitting(false);
    },
  });

  const { values, errors, handleChange } = formik;

  const handleEditClick = () => {
    formik.resetForm({ values: getRowData(typedRow, fieldIds) });
    setEditMode(true);
  };

  const handleCancelClick = () => {
    formik.resetForm({ values: getRowData(typedRow, fieldIds) });
    setEditMode(false);
  };

  const handleEditDataChange = (columnId: string, value: unknown) => {
    formik.setFieldValue(columnId, value);
  };

  return (
    <>
      {editableFields.map((cell) => {
        const dataType = (cell.column.columnDef as { dataType?: string })
          .dataType;
        const columnId = cell.column.id;
        const value = cell.getValue();

        if (groupedColumns?.includes(columnId)) return null;

        if (dataType === "actions") {
          return (
            <TableCell key={cell.id} {...cell.column.columnDef.meta}>
              {isEditMode ? (
                <Stack
                  direction="row"
                  sx={{
                    gap: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Tooltip title="Cancel">
                    <IconButton color="error" onClick={handleCancelClick}>
                      <CloseOutlined />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Save">
                    <IconButton
                      color="success"
                      type="submit"
                      onClick={formik.submitForm}
                    >
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
                          : "",
                      ]}
                    />
                  </IconButton>
                </Tooltip>
              )}
            </TableCell>
          );
        }

        return (
          <TableCell key={cell.id} {...cell.column.columnDef.meta}>
            {renderEditableField({
              columnId,
              dataType,
              value,
              isEditMode,
              values,
              errors,
              handleChange,
              handleEditDataChange,
              formik,
              row: typedRow,
            })}
          </TableCell>
        );
      })}
    </>
  );
}
