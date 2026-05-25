import { CSSProperties, ReactNode } from "react";
import IconButton from "@mui/material/IconButton";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";

import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender, Row } from "@tanstack/react-table";

import { TableDataProps } from "types/table";
import DragOutlined from "@ant-design/icons/DragOutlined";

const nonOrderableColumnId: UniqueIdentifier[] = ["drag-handle", "select"];

interface DraggableRowProps {
  children: ReactNode;
  row: Row<TableDataProps>;
  groupedColumns: string[];
}

export default function DraggableRow({
  children,
  row,
  groupedColumns,
}: DraggableRowProps) {
  const {
    transform,
    transition,
    setNodeRef,
    isDragging,
    attributes,
    listeners,
    setActivatorNodeRef,
  } = useSortable({ id: String(row.original.id) });

  const nonEditableCells = row
    .getVisibleCells()
    .filter((cell) => nonOrderableColumnId.includes(cell.column.id));

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: "relative",
  };

  const isGrouped = groupedColumns.length > 0;

  return (
    <TableRow ref={setNodeRef} style={style}>
      {isGrouped && (
        <TableCell colSpan={groupedColumns.length} sx={{ bgcolor: "error.lighter" }} />
      )}
      {nonEditableCells.map((cell) => {
        if (cell.column.id === "drag-handle") {
          if (!isGrouped) {
            return (
              <TableCell key={cell.id} sx={{ width: 58 }}>
                <IconButton
                  {...attributes}
                  {...listeners}
                  ref={setActivatorNodeRef}
                  size="small"
                  color="secondary"
                  sx={{
                    p: 0,
                    width: 24,
                    height: 24,
                    fontSize: "1rem",
                    cursor: isDragging ? "grabbing" : "grab",
                  }}
                >
                  <DragOutlined />
                </IconButton>
              </TableCell>
            );
          }
          return null;
        }
        return (
          <TableCell key={cell.id} {...cell.column.columnDef.meta}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        );
      })}
      {children}
    </TableRow>
  );
}