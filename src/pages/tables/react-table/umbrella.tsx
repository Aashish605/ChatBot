import { Fragment, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import { useTheme } from "@mui/material/styles";
import {
  Box,
  Button,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
} from "@mui/material";

import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToHorizontalAxis,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedMinMaxValues,
  getFacetedUniqueValues,
  getPaginationRowModel,
  getSortedRowModel,
  getGroupedRowModel,
  flexRender,
  useReactTable,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  GroupingState,
  FilterFn,
  SortingFn,
  sortingFns,
} from "@tanstack/react-table";
import {
  compareItems,
  rankItem,
  RankingInfo,
} from "@tanstack/match-sorter-utils";
import { LabelKeyObject } from "react-csv/lib/core";

import MainCard from "components/MainCard";
import {
  CSVExport,
  DebouncedInput,
  EmptyTable,
  Filter,
  IndeterminateCheckbox,
  RowSelection,
  TablePagination,
} from "components/third-party/react-table";
import {
  RowEditProvider,
  EditRowCells,
  EditRowExpandedRow,
} from "components/third-party/react-table/EditRow";
import DraggableTableCell from "components/third-party/react-table/DraggableTableCell";
import DraggableRow from "components/third-party/react-table/DraggableRow";
import DeleteConfirmDialog from "components/third-party/react-table/DeleteConfirmDialog";
import TableToast from "components/third-party/react-table/TableToast";

import { useKnowledgeBase } from "hooks/useKnowledgeBaseTable";
import { TableDataProps } from "types/table";

import PlusOutlined from "@ant-design/icons/PlusOutlined";
import GroupOutlined from "@ant-design/icons/GroupOutlined";
import UngroupOutlined from "@ant-design/icons/UngroupOutlined";

const HIDDEN_BY_DEFAULT_COLUMNS = [
  "question",
  "tags",
  "priority",
  "visibility",
  "answer",
  "content",
  "keywords",
  "common_user_phrases",
  "steps",
  "is_active",
];

const nonOrderableColumnId: UniqueIdentifier[] = ["drag-handle", "select"];

const fuzzyFilter: FilterFn<TableDataProps> = (
  row,
  columnId,
  value,
  addMeta,
) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta(itemRank);
  return itemRank.passed;
};

const fuzzySort: SortingFn<TableDataProps> = (rowA, rowB, columnId) => {
  let dir = 0;
  if (rowA.columnFiltersMeta[columnId]) {
    dir = compareItems(
      rowA.columnFiltersMeta[columnId]! as RankingInfo,
      rowB.columnFiltersMeta[columnId]! as RankingInfo,
    );
  }
  return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
};

export default function UmbrellaTable() {
  const theme = useTheme();

  const {
    data,
    loading,
    filteredData,
    dataIds,
    categories,
    categoryFilter,
    setCategoryFilter,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete,
    handleSave,
    handleSwapPriority,
    toast,
    handleToastClose,
  } = useKnowledgeBase();

  const columns = useMemo<ColumnDef<TableDataProps, unknown>[]>(
    () => [
      { id: "drag-handle", size: 60 },
      {
        id: "select",
        enableGrouping: false,
        header: ({ table }) => (
          <IndeterminateCheckbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
        size: 60,
      },
      {
        id: "id",
        title: "Id",
        header: "#",
        accessorFn: (row) => row.id,
        enableColumnFilter: false,
        enableGrouping: false,
        enableSorting: false,
        meta: { align: "center" },
      },
      {
        id: "title",
        header: "Title",
        footer: "Title",
        accessorKey: "title",
        dataType: "text",
        enableGrouping: false,
        enableSorting: false,
      },
      {
        id: "type",
        header: "Type",
        footer: "Type",
        accessorKey: "type",
        dataType: "text",
        enableGrouping: true,
        enableSorting: false,
        filterFn: fuzzyFilter,
        sortingFn: fuzzySort,
      },
      {
        id: "category",
        header: "Category",
        footer: "Category",
        accessorKey: "category",
        dataType: "text",
        enableGrouping: true,
        enableColumnFilter: false,
        enableSorting: false,
      },
      {
        id: "question",
        header: "Question",
        footer: "Question",
        accessorKey: "question",
        dataType: "text",
        enableGrouping: false,
      },
      {
        id: "tags",
        header: "Tags",
        footer: "Tags",
        accessorKey: "tags",
        dataType: "text",
        enableGrouping: false,
      },
      {
        id: "priority",
        header: "Priority",
        footer: "Priority",
        accessorKey: "priority",
        dataType: "number",
        meta: { align: "right" },
        enableGrouping: true,
      },
      {
        id: "visibility",
        header: "Visibility",
        footer: "Visibility",
        accessorKey: "visibility",
        dataType: "select",
        enableGrouping: true,
      },
      {
        id: "answer",
        header: "Answer",
        footer: "Answer",
        accessorKey: "answer",
        dataType: "text",
        enableGrouping: false,
      },
      {
        id: "content",
        header: "Content",
        footer: "Content",
        accessorKey: "content",
        dataType: "text",
        enableGrouping: false,
      },
      {
        id: "keywords",
        header: "Keywords",
        footer: "Keywords",
        accessorKey: "keywords",
        dataType: "text",
        enableGrouping: false,
      },
      {
        id: "common_user_phrases",
        header: "Common Phrases",
        footer: "Common Phrases",
        accessorKey: "common_user_phrases",
        dataType: "text",
        enableGrouping: false,
      },
      {
        id: "steps",
        header: "Steps",
        footer: "Steps",
        accessorKey: "steps",
        dataType: "steps",
        enableGrouping: false,
        enableColumnFilter: false,
        accessorFn: (row) =>
          row.steps.map((s, i) => `${i + 1}. ${s.text}`).join(" | "),
        cell: ({ row }) => {
          const steps = row.original.steps;
          if (!steps || steps.length === 0) return <span>—</span>;
          return (
            <span>
              {steps.map((s, i) => (
                <span key={i} style={{ display: "block", fontSize: "0.75rem" }}>
                  {i + 1}. {s.text}
                </span>
              ))}
            </span>
          );
        },
      },
      {
        id: "is_active",
        header: "Active",
        footer: "Active",
        accessorKey: "is_active",
        dataType: "select",
        enableGrouping: true,
      },
      {
        id: "actions",
        header: "Actions",
        dataType: "actions",
        meta: { align: "center" },
      },
    ],
    [],
  );

  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((c) => c.id!),
  );
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [grouping, setGrouping] = useState<GroupingState>([]);
  const [columnVisibility] = useState<Record<string, boolean>>(() =>
    HIDDEN_BY_DEFAULT_COLUMNS.reduce(
      (acc, columnId) => ({ ...acc, [columnId]: false }),
      {},
    ),
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getRowId: (row) => String(row.id),
    state: {
      rowSelection,
      columnFilters,
      globalFilter,
      sorting,
      grouping,
      columnOrder,
      columnVisibility,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onGroupingChange: setGrouping,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnOrderChange: setColumnOrder,
    getGroupedRowModel: getGroupedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    globalFilterFn: fuzzyFilter,
  });

  const headers: LabelKeyObject[] = [];
  table.getVisibleLeafColumns().map((column) => {
    const accessorKey = (column.columnDef as { accessorKey?: string })
      .accessorKey;
    headers.push({
      label:
        typeof column.columnDef.header === "string"
          ? column.columnDef.header
          : "#",
      key: accessorKey ?? "",
    });
  });

  function handleColumnDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      if (nonOrderableColumnId.includes(over.id)) return;
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex);
      });
    }
  }

  async function handleRowDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;
    await handleSwapPriority(active.id, over.id);
  }

  const columnSensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );
  const rowSensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const groupedColumns = table.getState().grouping;

  if (loading) return <div>Loading</div>;

  return (
    <MainCard content={false}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={(theme) => ({
          gap: 2,
          p: 2,
          justifyContent: "space-between",
          [theme.breakpoints.down("sm")]: {
            "& .MuiOutlinedInput-root, & .MuiFormControl-root": { width: 1 },
          },
        })}
      >
        <DebouncedInput
          value={globalFilter ?? ""}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Search ${data.length} records...`}
        />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{ alignItems: "center", gap: 2, width: { xs: 1, sm: "auto" } }}
        >
          <Stack sx={{ alignItems: "flex-end" }}>
            <RowSelection selected={Object.keys(rowSelection).length} />
            <Stack
              direction="row"
              sx={{
                gap: 2,
                alignItems: "center",
                width: { xs: 1, sm: "auto" },
              }}
            >
              <Button
                variant="contained"
                startIcon={<PlusOutlined />}
                component={RouterLink}
                {...{ to: "/form" }}
              >
                Add New
              </Button>
              <CSVExport
                {...{
                  data:
                    table
                      .getSelectedRowModel()
                      .flatRows.map((row) => row.original).length === 0
                      ? data
                      : table
                          .getSelectedRowModel()
                          .flatRows.map((row) => row.original),
                  headers,
                  filename: "umbrella.csv",
                }}
              />
            </Stack>
          </Stack>
        </Stack>
      </Stack>

      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={handleColumnDragEnd}
        sensors={columnSensors}
      >
        <TableContainer>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header) => {
                      if (
                        groupedColumns.length > 0 &&
                        header.column.id === "drag-handle"
                      )
                        return null;
                      return (
                        <DraggableTableCell
                          key={header.id}
                          header={header}
                          categoryFilter={categoryFilter}
                          setCategoryFilter={setCategoryFilter}
                          categories={categories}
                        />
                      );
                    })}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHead>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    if (
                      groupedColumns.length > 0 &&
                      header.column.id === "drag-handle"
                    )
                      return null;
                    return (
                      <TableCell
                        key={header.id}
                        {...header.column.columnDef.meta}
                      >
                        {header.column.getCanFilter() && (
                          <Filter column={header.column} table={table} />
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableHead>

            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                <DndContext
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis]}
                  onDragEnd={handleRowDragEnd}
                  sensors={rowSensors}
                >
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => {
                      if (row.getIsGrouped()) {
                        return (
                          <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell) => {
                              if (
                                groupedColumns.length > 0 &&
                                cell.column.id === "drag-handle"
                              )
                                return null;
                              return (
                                <TableCell
                                  key={cell.id}
                                  {...cell.column.columnDef.meta}
                                >
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                  )}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        );
                      }

                      return (
                        <Fragment key={row.id}>
                          <RowEditProvider
                            row={row}
                            hiddenColumnIds={HIDDEN_BY_DEFAULT_COLUMNS}
                            onDelete={(id) => setDeleteTarget(id)}
                            onSave={(updatedData) =>
                              handleSave(row.original.id, updatedData)
                            }
                          >
                            <DraggableRow
                              row={row}
                              groupedColumns={groupedColumns}
                            >
                              <EditRowCells groupedColumns={groupedColumns} />
                            </DraggableRow>
                            <EditRowExpandedRow
                              colSpan={table.getVisibleLeafColumns().length}
                              hiddenColumnIds={HIDDEN_BY_DEFAULT_COLUMNS}
                              columnLabels={{}}
                            />
                          </RowEditProvider>
                        </Fragment>
                      );
                    })}
                  </SortableContext>
                </DndContext>
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length}>
                    <EmptyTable msg="No Data" />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter>
              {table.getFooterGroups().map((footerGroup) => (
                <TableRow key={footerGroup.id}>
                  {footerGroup.headers.map((footer) => {
                    if (
                      groupedColumns.length > 0 &&
                      footer.column.id === "drag-handle"
                    )
                      return null;
                    return (
                      <TableCell
                        key={footer.id}
                        {...footer.column.columnDef.meta}
                      >
                        {footer.isPlaceholder
                          ? null
                          : flexRender(
                              footer.column.columnDef.header,
                              footer.getContext(),
                            )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableFooter>
          </Table>
        </TableContainer>
      </DndContext>

      <Divider />
      <Box sx={{ p: 2 }}>
        <TablePagination
          {...{
            setPageSize: table.setPageSize,
            setPageIndex: table.setPageIndex,
            getState: table.getState,
            getPageCount: table.getPageCount,
          }}
        />
      </Box>

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
      <TableToast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={handleToastClose}
      />
    </MainCard>
  );
}
