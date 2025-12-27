/**
 * DataTable Component
 *
 * Scrollable data table with sorting, and custom rendering.
 *
 * @example
 * // Basic table
 * <DataTable
 *   columns={[
 *     { key: 'name', header: 'Name' },
 *     { key: 'email', header: 'Email' },
 *     { key: 'role', header: 'Role' },
 *   ]}
 *   data={users}
 * />
 *
 * // With sorting and custom cell rendering
 * <DataTable
 *   columns={[
 *     { key: 'name', header: 'Name', sortable: true },
 *     { key: 'amount', header: 'Amount', render: (val) => `$${val.toFixed(2)}` },
 *     { key: 'status', header: 'Status', render: (val) => <StatusBadge status={val} /> },
 *   ]}
 *   data={transactions}
 *   sortBy="amount"
 *   sortOrder="desc"
 *   onSort={handleSort}
 * />
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  type ViewStyle,
  type DimensionValue,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ===========================================
// TYPES
// ===========================================

export type SortOrder = 'asc' | 'desc' | null;
export type TableSize = 'sm' | 'md' | 'lg';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: number | string;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
}

export interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  keyExtractor?: (item: T, index: number) => string;
  sortBy?: string;
  sortOrder?: SortOrder;
  onSort?: (key: string, order: SortOrder) => void;
  onRowPress?: (item: T, index: number) => void;
  selectedRows?: Set<string | number>;
  onSelectRow?: (key: string | number) => void;
  size?: TableSize;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  stickyHeader?: boolean;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
  style?: ViewStyle;
  testID?: string;
}

// ===========================================
// SIZE CONFIGURATIONS
// ===========================================

const sizeClasses: Record<TableSize, { cell: string; header: string; text: string }> = {
  sm: { cell: 'py-2 px-3', header: 'py-2 px-3', text: 'text-sm' },
  md: { cell: 'py-3 px-4', header: 'py-3 px-4', text: 'text-base' },
  lg: { cell: 'py-4 px-5', header: 'py-4 px-5', text: 'text-lg' },
};

// ===========================================
// MAIN DATATABLE COMPONENT
// ===========================================

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor = (_, index) => String(index),
  sortBy,
  sortOrder,
  onSort,
  onRowPress,
  selectedRows,
  onSelectRow,
  size = 'md',
  striped = false,
  bordered = false,
  hoverable = true,
  stickyHeader = true,
  emptyMessage = 'No data available',
  loading = false,
  className = '',
  style,
  testID,
}: DataTableProps<T>) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const sizeConfig = sizeClasses[size];

  const handleSort = useCallback(
    (columnKey: string) => {
      if (!onSort) return;

      let newOrder: SortOrder = 'asc';
      if (sortBy === columnKey) {
        if (sortOrder === 'asc') newOrder = 'desc';
        else if (sortOrder === 'desc') newOrder = null;
      }
      onSort(columnKey, newOrder);
    },
    [sortBy, sortOrder, onSort]
  );

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center justify-center';
      case 'right':
        return 'text-right justify-end';
      default:
        return 'text-left justify-start';
    }
  };

  const borderClass = bordered
    ? isDark
      ? 'border border-border-dark'
      : 'border border-border'
    : '';

  const renderHeader = () => (
    <View
      className={`flex-row ${isDark ? 'bg-background-dark-tertiary' : 'bg-background-secondary'}`}
      style={stickyHeader ? { zIndex: 1 } : undefined}
    >
      {columns.map((column, index) => {
        const isSorted = sortBy === column.key;
        const isSortable = column.sortable && onSort;

        return (
          <TouchableOpacity
            key={String(column.key)}
            className={`${sizeConfig.header} ${getAlignClass(column.align)} flex-row items-center ${
              index < columns.length - 1
                ? isDark
                  ? 'border-r border-border-dark'
                  : 'border-r border-border'
                : ''
            }`}
            style={{
              width: column.width as DimensionValue,
              minWidth: column.minWidth,
              maxWidth: column.maxWidth,
              flex: column.width ? undefined : 1,
            }}
            onPress={isSortable ? () => handleSort(String(column.key)) : undefined}
            disabled={!isSortable}
            activeOpacity={isSortable ? 0.7 : 1}
          >
            {column.headerRender ? (
              column.headerRender()
            ) : (
              <>
                <Text
                  className={`${sizeConfig.text} font-semibold ${
                    isDark ? 'text-foreground-dark' : 'text-foreground'
                  }`}
                  numberOfLines={1}
                >
                  {column.header}
                </Text>
                {isSortable && (
                  <View className="ml-1">
                    {isSorted ? (
                      <Ionicons
                        name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
                        size={14}
                        color={isDark ? '#60a5fa' : '#0a7ea4'}
                      />
                    ) : (
                      <Ionicons
                        name="swap-vertical"
                        size={14}
                        color={isDark ? '#6b7280' : '#9ca3af'}
                      />
                    )}
                  </View>
                )}
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderRow = (item: T, rowIndex: number) => {
    const rowKey = keyExtractor(item, rowIndex);
    const isSelected = selectedRows?.has(rowKey);
    const isClickable = onRowPress || onSelectRow;

    const rowBg = isSelected
      ? isDark
        ? 'bg-primary-500/20'
        : 'bg-primary/10'
      : striped && rowIndex % 2 === 1
        ? isDark
          ? 'bg-background-dark-tertiary/50'
          : 'bg-background-secondary/50'
        : '';

    const RowWrapper = isClickable ? TouchableOpacity : View;
    const rowProps = isClickable
      ? {
          onPress: () => {
            onSelectRow?.(rowKey);
            onRowPress?.(item, rowIndex);
          },
          activeOpacity: 0.7,
        }
      : {};

    return (
      <RowWrapper
        key={rowKey}
        className={`flex-row ${rowBg} ${
          bordered ? (isDark ? 'border-b border-border-dark' : 'border-b border-border') : ''
        }`}
        {...rowProps}
      >
        {columns.map((column, colIndex) => {
          const value = item[column.key as keyof T];
          const cellContent = column.render
            ? column.render(value, item, rowIndex)
            : String(value ?? '');

          return (
            <View
              key={String(column.key)}
              className={`${sizeConfig.cell} ${getAlignClass(column.align)} ${
                colIndex < columns.length - 1
                  ? bordered
                    ? isDark
                      ? 'border-r border-border-dark'
                      : 'border-r border-border'
                    : ''
                  : ''
              }`}
              style={{
                width: column.width as DimensionValue,
                minWidth: column.minWidth,
                maxWidth: column.maxWidth,
                flex: column.width ? undefined : 1,
              }}
            >
              {typeof cellContent === 'string' ? (
                <Text
                  className={`${sizeConfig.text} ${
                    isDark ? 'text-foreground-dark' : 'text-foreground'
                  }`}
                  numberOfLines={2}
                >
                  {cellContent}
                </Text>
              ) : (
                cellContent
              )}
            </View>
          );
        })}
      </RowWrapper>
    );
  };

  const renderEmpty = () => (
    <View className="py-12 items-center justify-center">
      <Ionicons name="file-tray-outline" size={48} color={isDark ? '#6b7280' : '#9ca3af'} />
      <Text
        className={`mt-3 ${sizeConfig.text} ${
          isDark ? 'text-foreground-dark-muted' : 'text-foreground-muted'
        }`}
      >
        {emptyMessage}
      </Text>
    </View>
  );

  const renderLoading = () => (
    <View className="py-8">
      {[1, 2, 3].map((i) => (
        <View key={i} className="flex-row py-3 px-4">
          {columns.map((col, j) => (
            <View
              key={j}
              className={`flex-1 h-4 rounded ${
                isDark ? 'bg-background-dark-tertiary' : 'bg-background-secondary'
              }`}
              style={{ marginRight: j < columns.length - 1 ? 8 : 0 }}
            />
          ))}
        </View>
      ))}
    </View>
  );

  return (
    <View
      className={`rounded-xl overflow-hidden ${borderClass} ${className}`}
      style={style}
      testID={testID}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ minWidth: '100%' }}>
          {renderHeader()}
          <ScrollView showsVerticalScrollIndicator={false}>
            {loading
              ? renderLoading()
              : data.length === 0
                ? renderEmpty()
                : data.map((item, index) => renderRow(item, index))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

// ===========================================
// CONVENIENCE COMPONENTS
// ===========================================

/**
 * SimpleTable - Basic table without advanced features
 */
export interface SimpleTableProps<T extends Record<string, unknown>> {
  columns: { key: keyof T; header: string }[];
  data: T[];
  className?: string;
}

export function SimpleTable<T extends Record<string, unknown>>({
  columns,
  data,
  className,
}: SimpleTableProps<T>) {
  return (
    <DataTable
      columns={columns.map((c) => ({ ...c, key: String(c.key) }))}
      data={data}
      size="sm"
      bordered
      className={className}
    />
  );
}

/**
 * KeyValueTable - Two-column key-value display
 */
export interface KeyValueTableProps {
  data: { label: string; value: React.ReactNode }[];
  className?: string;
}

export function KeyValueTable({ data, className = '' }: KeyValueTableProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className={`rounded-xl overflow-hidden ${className}`}>
      {data.map((item, index) => (
        <View
          key={index}
          className={`flex-row py-3 px-4 ${
            index < data.length - 1
              ? isDark
                ? 'border-b border-border-dark'
                : 'border-b border-border'
              : ''
          } ${
            index % 2 === 0
              ? isDark
                ? 'bg-background-dark-tertiary/50'
                : 'bg-background-secondary/50'
              : ''
          }`}
        >
          <Text
            className={`flex-1 text-sm font-medium ${
              isDark ? 'text-foreground-dark-muted' : 'text-foreground-muted'
            }`}
          >
            {item.label}
          </Text>
          <View className="flex-1 items-end">
            {typeof item.value === 'string' ? (
              <Text className={`text-sm ${isDark ? 'text-foreground-dark' : 'text-foreground'}`}>
                {item.value}
              </Text>
            ) : (
              item.value
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

/**
 * SelectableTable - Table with row selection
 */
export interface SelectableTableProps<T extends Record<string, unknown>> extends Omit<
  DataTableProps<T>,
  'selectedRows' | 'onSelectRow'
> {
  onSelectionChange?: (selectedKeys: Set<string | number>) => void;
  multiSelect?: boolean;
}

export function SelectableTable<T extends Record<string, unknown>>({
  onSelectionChange,
  multiSelect = false,
  keyExtractor = (_, index) => String(index),
  ...props
}: SelectableTableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());

  const handleSelectRow = useCallback(
    (key: string | number) => {
      setSelectedRows((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(key)) {
          newSet.delete(key);
        } else {
          if (!multiSelect) {
            newSet.clear();
          }
          newSet.add(key);
        }
        onSelectionChange?.(newSet);
        return newSet;
      });
    },
    [multiSelect, onSelectionChange]
  );

  return (
    <DataTable
      {...props}
      keyExtractor={keyExtractor}
      selectedRows={selectedRows}
      onSelectRow={handleSelectRow}
    />
  );
}
