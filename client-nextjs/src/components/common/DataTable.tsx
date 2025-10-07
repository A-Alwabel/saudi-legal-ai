'use client';

import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  Checkbox,
  IconButton,
  Toolbar,
  Typography,
  Tooltip,
  alpha,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Delete,
  FilterList,
  Search,
  MoreVert,
  Edit,
  Visibility,
  Download,
  Print,
} from '@mui/icons-material';
import { visuallyHidden } from '@mui/utils';

interface Column {
  id: string;
  label: string;
  labelAr?: string;
  numeric?: boolean;
  width?: string | number;
  format?: (value: any, row?: any) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  title?: string;
  titleAr?: string;
  selectable?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (ids: string[]) => void;
  onView?: (id: string) => void;
  onExport?: () => void;
  onPrint?: () => void;
  searchable?: boolean;
  actions?: boolean;
  loading?: boolean;
  locale?: 'en' | 'ar';
}

type Order = 'asc' | 'desc';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string },
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export default function DataTable({
  columns,
  data,
  title,
  titleAr,
  selectable = true,
  onEdit,
  onDelete,
  onView,
  onExport,
  onPrint,
  searchable = true,
  actions = true,
  loading = false,
  locale = 'en',
}: DataTableProps) {
  const theme = useTheme();
  const isRTL = locale === 'ar';
  
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>(columns[0]?.id || '');
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRow, setSelectedRow] = useState<string | null>(null);

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = data.map((n) => n.id || n._id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  // Filter data based on search term
  const filteredData = data.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort data
  const sortedData = React.useMemo(
    () => filteredData.slice().sort(getComparator(order, orderBy)),
    [order, orderBy, filteredData]
  );

  // Paginate data
  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const numSelected = selected.length;
  const rowCount = filteredData.length;

  return (
    <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          ...(numSelected > 0 && {
            bgcolor: (theme) =>
              alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
          }),
        }}
      >
        {numSelected > 0 ? (
          <Typography
            sx={{ flex: '1 1 100%' }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {numSelected} {isRTL ? 'محدد' : 'selected'}
          </Typography>
        ) : (
          <>
            <Typography
              sx={{ flex: '1 1 100%' }}
              variant="h6"
              id="tableTitle"
              component="div"
            >
              {isRTL ? titleAr || title : title}
            </Typography>
            {searchable && (
              <TextField
                variant="outlined"
                size="small"
                placeholder={isRTL ? 'بحث...' : 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ mr: 2, minWidth: 200 }}
              />
            )}
          </>
        )}

        {numSelected > 0 ? (
          <Tooltip title={isRTL ? 'حذف' : 'Delete'}>
            <IconButton onClick={() => onDelete && onDelete(selected)}>
              <Delete />
            </IconButton>
          </Tooltip>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {onExport && (
              <Tooltip title={isRTL ? 'تصدير' : 'Export'}>
                <IconButton onClick={onExport}>
                  <Download />
                </IconButton>
              </Tooltip>
            )}
            {onPrint && (
              <Tooltip title={isRTL ? 'طباعة' : 'Print'}>
                <IconButton onClick={onPrint}>
                  <Print />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={isRTL ? 'تصفية' : 'Filter'}>
              <IconButton>
                <FilterList />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Toolbar>

      <TableContainer>
        <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    color="primary"
                    indeterminate={numSelected > 0 && numSelected < rowCount}
                    checked={rowCount > 0 && numSelected === rowCount}
                    onChange={handleSelectAllClick}
                    inputProps={{
                      'aria-label': 'select all',
                    }}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.numeric ? 'right' : 'left'}
                  padding={'normal'}
                  sortDirection={orderBy === column.id ? order : false}
                  sx={{ fontWeight: 600 }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleRequestSort(column.id)}
                    >
                      {isRTL ? column.labelAr || column.label : column.label}
                      {orderBy === column.id ? (
                        <Box component="span" sx={visuallyHidden}>
                          {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                        </Box>
                      ) : null}
                    </TableSortLabel>
                  ) : (
                    isRTL ? column.labelAr || column.label : column.label
                  )}
                </TableCell>
              ))}
              {actions && (
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  {isRTL ? 'الإجراءات' : 'Actions'}
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} align="center">
                  {isRTL ? 'جاري التحميل...' : 'Loading...'}
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)} align="center">
                  {isRTL ? 'لا توجد بيانات' : 'No data available'}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => {
                const rowId = row.id || row._id;
                const isItemSelected = isSelected(rowId);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={rowId}
                    selected={isItemSelected}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          color="primary"
                          checked={isItemSelected}
                          onChange={() => handleClick(rowId)}
                          inputProps={{
                            'aria-labelledby': labelId,
                          }}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.id} align={column.numeric ? 'right' : 'left'}>
                        {column.format ? column.format(row[column.id], row) : row[column.id]}
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, rowId)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={isRTL ? 'الصفوف لكل صفحة:' : 'Rows per page:'}
        labelDisplayedRows={({ from, to, count }) =>
          isRTL
            ? `${from}-${to} من ${count !== -1 ? count : `أكثر من ${to}`}`
            : `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
        }
      />

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {onView && (
          <MenuItem onClick={() => { onView(selectedRow!); handleMenuClose(); }}>
            <Visibility sx={{ mr: 1, fontSize: 18 }} />
            {isRTL ? 'عرض' : 'View'}
          </MenuItem>
        )}
        {onEdit && (
          <MenuItem onClick={() => { onEdit(selectedRow!); handleMenuClose(); }}>
            <Edit sx={{ mr: 1, fontSize: 18 }} />
            {isRTL ? 'تعديل' : 'Edit'}
          </MenuItem>
        )}
        {onDelete && (
          <MenuItem onClick={() => { onDelete([selectedRow!]); handleMenuClose(); }} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1, fontSize: 18 }} />
            {isRTL ? 'حذف' : 'Delete'}
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
}
