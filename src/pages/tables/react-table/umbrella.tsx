import {
  CSSProperties,
  Fragment,
  ReactNode,
  useMemo,
  useState,
  useEffect,
} from "react";

// material-ui
import { useTheme } from "@mui/material/styles";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableFooter from "@mui/material/TableFooter";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Box from "@mui/material/Box";

// third-party
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  compareItems,
  rankItem,
  RankingInfo,
} from "@tanstack/match-sorter-utils";
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
  Header,
  Row,
} from "@tanstack/react-table";
import { LabelKeyObject } from "react-csv/lib/core";

// project imports
import MainCard from "components/MainCard";
import {
  CSVExport,
  DebouncedInput,
  EmptyTable,
  Filter,
  HeaderSort,
  IndeterminateCheckbox,
  RowSelection,
  TablePagination,
} from "components/third-party/react-table";
import {
  RowEditProvider,
  EditRowCells,
  EditRowExpandedRow,
} from "components/third-party/react-table/EditRow";

// import TableData from "data/react-table";
import { getKnowledgeBaseData } from "data/react-table";

// types
import { TableDataProps } from "types/table";
import { updateKnowledgeBaseRow } from "api/knowledgeBaseApi";
import { deleteKnowledgeBaseRow } from "api/knowledgeBaseApi";

import {
  arrayToInput,
  inputToArray,
  normalizeSteps,
} from "utils/knowledgeBaseTransform";
// assets
import DragOutlined from "@ant-design/icons/DragOutlined";
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

const nonOrderableColumnId: UniqueIdentifier[] = [
  "drag-handle",
  // "expander",
  "select",
];

// ==============================|| REACT TABLE - DRAGGABLE HEADER ||============================== //

function DraggableTableCell({
  header,
  categoryFilter,
  setCategoryFilter,
  categories,
}: {
  header: Header<TableDataProps, unknown>;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  categories: string[];
}) {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    });

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
              {header.column.getIsGrouped() ? (
                <UngroupOutlined />
              ) : (
                <GroupOutlined />
              )}
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
              onChange={(event) => setCategoryFilter(event.target.value)}
              onClick={(event) => event.stopPropagation()}
              displayEmpty
              size="small"
              input={<OutlinedInput />}
              slotProps={{ input: { "aria-label": "Category Filter" } }}
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

// ==============================|| REACT TABLE - DRAGGABLE ROW ||============================== //

function DraggableRow({
  children,
  row,
  groupedColumns,
}: {
  children: ReactNode;
  row: Row<TableDataProps>;
  groupedColumns: string[];
}) {
  // `id` is now `number` on TableDataProps — cast to string for DnD UniqueIdentifier compatibility
  const {
    transform,
    transition,
    setNodeRef,
    isDragging,
    attributes,
    listeners,
    setActivatorNodeRef,
  } = useSortable({
    id: String(row.original.id),
  });

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
        <TableCell
          colSpan={groupedColumns.length}
          sx={{ bgcolor: "error.lighter" }}
        />
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
          } else {
            return null;
          }
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

// ==============================|| REACT TABLE - UMBRELLA ||============================== //

export default function UmbrellaTable() {
  const theme = useTheme();

  const columns = useMemo<ColumnDef<TableDataProps, unknown>[]>(
    () => [
      { id: "drag-handle", size: 60 },
      // {
      //   id: "expander",
      //   enableGrouping: false,
      //   header: () => null,
      //   cell: ({ row }) =>
      //     row.getCanExpand() ? (
      //       <ExpanderButton row={row} />
      //     ) : (
      //       <IconButton color="secondary" size="small" disabled>
      //         <StopOutlined />
      //       </IconButton>
      //     ),
      //   size: 60,
      // },
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
      // ── Columns mapped to TableDataProps fields ──────────────────────────
      {
        id: "id",
        title: "Id",
        header: "#",
        // `id` is number on TableDataProps
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
        sortingFn: fuzzySort,
      },
      {
        id: "question",
        header: "Question",
        footer: "Question",
        // maps to `question: string` on TableDataProps
        accessorKey: "question",
        dataType: "text",
        enableGrouping: false,
      },
      {
        id: "tags",
        header: "Tags",
        footer: "Tags",
        // maps to `tags: string` on TableDataProps
        accessorKey: "tags",
        dataType: "text",
        enableGrouping: false,
      },
      {
        id: "priority",
        header: "Priority",
        footer: "Priority",
        // maps to `priority: number` on TableDataProps
        accessorKey: "priority",
        dataType: "number",
        meta: { align: "right" },
        enableGrouping: true,
      },
      {
        id: "visibility",
        header: "Visibility",
        footer: "Visibility",
        // maps to `visibility: "public" | "private"` on TableDataProps
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
        // Convert array to string so React never sees a raw object
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
        // maps to `is_active: boolean` on TableDataProps
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

  const [data, setData] = useState<TableDataProps[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const result = await getKnowledgeBaseData();
        setData(result);
      } catch (err) {
        console.error("Error during loding data from react-table", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((c) => c.id!),
  );

  // `id` is number — stringify for DnD UniqueIdentifier
  const dataIds = useMemo<UniqueIdentifier[]>(
    () => data.map((row) => String(row.id)),
    [data],
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

  const [categoryFilter, setCategoryFilter] = useState("");

  const categories = useMemo(
    () => [...new Set(data.map((row) => row.category))].sort(),
    [data],
  );

  const filteredData = useMemo(() => {
    if (!categoryFilter) return data;
    return data.filter((row) => row.category === categoryFilter);
  }, [categoryFilter, data]);

  const table = useReactTable({
    data: filteredData,
    columns,
    // `id` is number — convert to string for react-table row identity
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

  function handleRowDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
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

  if (loading) {
    return <div>Loading</div>;
  }

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

      {/* Column DnD Context */}
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
                            onDelete={async (id) => {
                              try {
                                await deleteKnowledgeBaseRow(id); // your supabase delete function
                                setData((prev) =>
                                  prev.filter((item) => item.id !== id),
                                );
                              } catch (err) {
                                console.error("Failed to delete row", err);
                              }
                            }}
                            onSave={async (updatedData) => {
                              try {
                                const payload: Partial<TableDataProps> = {
                                  title: String(updatedData.title || ""),
                                  type: String(updatedData.type || ""),
                                  category: String(updatedData.category || ""),
                                  question: String(updatedData.question || ""),
                                  answer: String(updatedData.answer || ""),
                                  content: String(updatedData.content || ""),
                                  priority: Number(updatedData.priority),
                                  is_active:
                                    updatedData.is_active === true ||
                                    updatedData.is_active === "true",
                                  visibility: updatedData.visibility as
                                    | "public"
                                    | "private",

                                  // postgres text[] — convert comma string back to array
                                  tags: inputToArray(
                                    String(updatedData.tags || ""),
                                  ),
                                  keywords: inputToArray(
                                    String(updatedData.keywords || ""),
                                  ),
                                  common_user_phrases: inputToArray(
                                    String(
                                      updatedData.common_user_phrases || "",
                                    ),
                                  ),

                                  // jsonb
                                  steps: normalizeSteps(updatedData.steps),
                                };

                                // remove undefined values
                                const cleanedPayload = Object.fromEntries(
                                  Object.entries(payload).filter(
                                    ([_, value]) => value !== undefined,
                                  ),
                                );

                                // supabase update
                                const savedRow = await updateKnowledgeBaseRow(
                                  row.original.id,
                                  cleanedPayload,
                                );

                                // update local table state
                                setData((prev) =>
                                  prev.map((item) =>
                                    item.id === row.original.id
                                      ? savedRow
                                      : item,
                                  ),
                                );
                              } catch (err) {
                                console.error("Failed to update row", err);
                              }
                            }}
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
    </MainCard>
  );
}
