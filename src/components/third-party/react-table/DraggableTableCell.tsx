import { CSSProperties } from "react";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TableCell from "@mui/material/TableCell";
import Box from "@mui/material/Box";

import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender, Header } from "@tanstack/react-table";

import { HeaderSort } from "components/third-party/react-table";
import { TableDataProps } from "types/table";

import GroupOutlined from "@ant-design/icons/GroupOutlined";
import UngroupOutlined from "@ant-design/icons/UngroupOutlined";

const nonOrderableColumnId: UniqueIdentifier[] = ["drag-handle", "select"];

interface DraggableTableCellProps {
  header: Header<TableDataProps, unknown>;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  categories: string[];
}

export default function DraggableTableCell({
  header,
  categoryFilter,
  setCategoryFilter,
  categories,
}: DraggableTableCellProps) {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({ id: header.column.id });

  const style: CSSProperties = {
    opacity: isDragging ? 0.7 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform),
    transition: "width transform 0.2s ease-in-out",
    whiteSpace: "nowrap",
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <TableCell
      colSpan={header.colSpan}
      ref={setNodeRef}
      style={style}
      {...header.column.columnDef.meta}
    >
      {header.isPlaceholder ? null : (
        <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
          {header.column.getCanGroup() && (
            <IconButton
              color={header.column.getIsGrouped() ? "error" : "primary"}
              onClick={header.column.getToggleGroupingHandler()}
              size="small"
              sx={{ p: 0, width: 24, height: 24, fontSize: "1rem", mr: 0.75 }}
            >
              {header.column.getIsGrouped() ? <UngroupOutlined /> : <GroupOutlined />}
            </IconButton>
          )}
          <Box
            {...(!nonOrderableColumnId.includes(header.id) && {
              ...attributes,
              ...listeners,
              sx: { cursor: isDragging ? "grabbing" : "grab" },
            })}
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
          </Box>
          {header.column.id === "category" ? (
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              displayEmpty
              size="small"
              input={<OutlinedInput />}
              sx={{
                minWidth: 140,
                "& .MuiSelect-select": { py: 0.5, fontSize: "0.75rem" },
              }}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          ) : (
            header.column.getCanSort() && (
              <HeaderSort column={header.column} sort />
            )
          )}
        </Stack>
      )}
    </TableCell>
  );
}