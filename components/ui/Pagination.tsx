/**
 * Pagination Component
 *
 * Controls for navigating through paginated content.
 *
 * @example
 * // Basic pagination
 * <Pagination
 *   currentPage={page}
 *   totalPages={10}
 *   onPageChange={setPage}
 * />
 *
 * // Compact pagination
 * <Pagination
 *   currentPage={page}
 *   totalPages={100}
 *   onPageChange={setPage}
 *   variant="compact"
 * />
 *
 * // With page size selector
 * <Pagination
 *   currentPage={page}
 *   totalPages={Math.ceil(total / pageSize)}
 *   onPageChange={setPage}
 *   showPageSize
 *   pageSize={pageSize}
 *   onPageSizeChange={setPageSize}
 * />
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ===========================================
// TYPES
// ===========================================

export type PaginationVariant = 'default' | 'compact' | 'simple' | 'minimal';
export type PaginationSize = 'sm' | 'md' | 'lg';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  variant?: PaginationVariant;
  size?: PaginationSize;
  siblingCount?: number;
  showFirstLast?: boolean;
  showPageSize?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
  testID?: string;
}

// ===========================================
// SIZE CONFIGURATIONS
// ===========================================

const sizeClasses: Record<PaginationSize, { button: string; text: string; icon: number }> = {
  sm: { button: 'w-8 h-8', text: 'text-sm', icon: 16 },
  md: { button: 'w-10 h-10', text: 'text-base', icon: 20 },
  lg: { button: 'w-12 h-12', text: 'text-lg', icon: 24 },
};

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function range(start: number, end: number): number[] {
  const length = end - start + 1;
  return Array.from({ length }, (_, i) => start + i);
}

function usePaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | 'dots')[] {
  return useMemo(() => {
    const totalPageNumbers = siblingCount * 2 + 5; // siblings + first + last + current + 2 dots

    // Case 1: Total pages less than page numbers we want to show
    if (totalPages <= totalPageNumbers) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 1;

    // Case 2: No left dots, show right dots
    if (!showLeftDots && showRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = range(1, leftItemCount);
      return [...leftRange, 'dots', totalPages];
    }

    // Case 3: Show left dots, no right dots
    if (showLeftDots && !showRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = range(totalPages - rightItemCount + 1, totalPages);
      return [1, 'dots', ...rightRange];
    }

    // Case 4: Show both left and right dots
    const middleRange = range(leftSiblingIndex, rightSiblingIndex);
    return [1, 'dots', ...middleRange, 'dots', totalPages];
  }, [currentPage, totalPages, siblingCount]);
}

// ===========================================
// MAIN PAGINATION COMPONENT
// ===========================================

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  variant = 'default',
  size = 'md',
  siblingCount = 1,
  showFirstLast = true,
  showPageSize = false,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  onPageSizeChange,
  disabled = false,
  className = '',
  style,
  testID,
}: PaginationProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const sizeConfig = sizeClasses[size];

  const paginationRange = usePaginationRange(currentPage, totalPages, siblingCount);

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handlePrev = () => {
    if (canGoPrev && !disabled) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext && !disabled) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirst = () => {
    if (currentPage !== 1 && !disabled) {
      onPageChange(1);
    }
  };

  const handleLast = () => {
    if (currentPage !== totalPages && !disabled) {
      onPageChange(totalPages);
    }
  };

  const baseButtonClass = `${sizeConfig.button} items-center justify-center rounded-lg`;
  const activeButtonClass = isDark ? 'bg-primary-500' : 'bg-primary';
  const inactiveButtonClass = isDark ? 'bg-background-dark-tertiary' : 'bg-background-secondary';
  const disabledButtonClass = 'opacity-40';

  const renderPageButton = (page: number | 'dots', index: number) => {
    if (page === 'dots') {
      return (
        <View key={`dots-${index}`} className={`${sizeConfig.button} items-center justify-center`}>
          <Text
            className={`${sizeConfig.text} ${isDark ? 'text-foreground-dark-muted' : 'text-foreground-muted'}`}
          >
            ...
          </Text>
        </View>
      );
    }

    const isActive = page === currentPage;

    return (
      <TouchableOpacity
        key={page}
        className={`${baseButtonClass} ${isActive ? activeButtonClass : inactiveButtonClass} ${disabled ? disabledButtonClass : ''}`}
        onPress={() => !disabled && onPageChange(page)}
        disabled={disabled || isActive}
        accessibilityRole="button"
        accessibilityLabel={`Page ${page}`}
        accessibilityState={{ selected: isActive }}
      >
        <Text
          className={`${sizeConfig.text} font-medium ${
            isActive ? 'text-white' : isDark ? 'text-foreground-dark' : 'text-foreground'
          }`}
        >
          {page}
        </Text>
      </TouchableOpacity>
    );
  };

  // Minimal variant: just arrows and current/total
  if (variant === 'minimal') {
    return (
      <View className={`flex-row items-center gap-3 ${className}`} style={style} testID={testID}>
        <TouchableOpacity
          onPress={handlePrev}
          disabled={!canGoPrev || disabled}
          className={`${baseButtonClass} ${inactiveButtonClass} ${!canGoPrev || disabled ? disabledButtonClass : ''}`}
        >
          <Ionicons
            name="chevron-back"
            size={sizeConfig.icon}
            color={isDark ? '#e5e7eb' : '#374151'}
          />
        </TouchableOpacity>
        <Text
          className={`${sizeConfig.text} ${isDark ? 'text-foreground-dark' : 'text-foreground'}`}
        >
          {currentPage} / {totalPages}
        </Text>
        <TouchableOpacity
          onPress={handleNext}
          disabled={!canGoNext || disabled}
          className={`${baseButtonClass} ${inactiveButtonClass} ${!canGoNext || disabled ? disabledButtonClass : ''}`}
        >
          <Ionicons
            name="chevron-forward"
            size={sizeConfig.icon}
            color={isDark ? '#e5e7eb' : '#374151'}
          />
        </TouchableOpacity>
      </View>
    );
  }

  // Simple variant: prev/next with page info
  if (variant === 'simple') {
    return (
      <View
        className={`flex-row items-center justify-between ${className}`}
        style={style}
        testID={testID}
      >
        <TouchableOpacity
          onPress={handlePrev}
          disabled={!canGoPrev || disabled}
          className={`flex-row items-center gap-1 py-2 px-3 rounded-lg ${!canGoPrev || disabled ? 'opacity-40' : ''}`}
        >
          <Ionicons
            name="chevron-back"
            size={sizeConfig.icon}
            color={isDark ? '#60a5fa' : '#0a7ea4'}
          />
          <Text
            className={`${sizeConfig.text} font-medium ${isDark ? 'text-primary-400' : 'text-primary'}`}
          >
            Previous
          </Text>
        </TouchableOpacity>
        <Text
          className={`${sizeConfig.text} ${isDark ? 'text-foreground-dark-muted' : 'text-foreground-muted'}`}
        >
          Page {currentPage} of {totalPages}
        </Text>
        <TouchableOpacity
          onPress={handleNext}
          disabled={!canGoNext || disabled}
          className={`flex-row items-center gap-1 py-2 px-3 rounded-lg ${!canGoNext || disabled ? 'opacity-40' : ''}`}
        >
          <Text
            className={`${sizeConfig.text} font-medium ${isDark ? 'text-primary-400' : 'text-primary'}`}
          >
            Next
          </Text>
          <Ionicons
            name="chevron-forward"
            size={sizeConfig.icon}
            color={isDark ? '#60a5fa' : '#0a7ea4'}
          />
        </TouchableOpacity>
      </View>
    );
  }

  // Compact variant: arrows with current page
  if (variant === 'compact') {
    return (
      <View className={`flex-row items-center gap-2 ${className}`} style={style} testID={testID}>
        {showFirstLast && (
          <TouchableOpacity
            onPress={handleFirst}
            disabled={currentPage === 1 || disabled}
            className={`${baseButtonClass} ${inactiveButtonClass} ${currentPage === 1 || disabled ? disabledButtonClass : ''}`}
          >
            <Ionicons
              name="chevron-back"
              size={sizeConfig.icon - 4}
              color={isDark ? '#e5e7eb' : '#374151'}
            />
            <Ionicons
              name="chevron-back"
              size={sizeConfig.icon - 4}
              color={isDark ? '#e5e7eb' : '#374151'}
              style={{ marginLeft: -8 }}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handlePrev}
          disabled={!canGoPrev || disabled}
          className={`${baseButtonClass} ${inactiveButtonClass} ${!canGoPrev || disabled ? disabledButtonClass : ''}`}
        >
          <Ionicons
            name="chevron-back"
            size={sizeConfig.icon}
            color={isDark ? '#e5e7eb' : '#374151'}
          />
        </TouchableOpacity>
        <View className={`${baseButtonClass} ${activeButtonClass}`}>
          <Text className={`${sizeConfig.text} font-medium text-white`}>{currentPage}</Text>
        </View>
        <TouchableOpacity
          onPress={handleNext}
          disabled={!canGoNext || disabled}
          className={`${baseButtonClass} ${inactiveButtonClass} ${!canGoNext || disabled ? disabledButtonClass : ''}`}
        >
          <Ionicons
            name="chevron-forward"
            size={sizeConfig.icon}
            color={isDark ? '#e5e7eb' : '#374151'}
          />
        </TouchableOpacity>
        {showFirstLast && (
          <TouchableOpacity
            onPress={handleLast}
            disabled={currentPage === totalPages || disabled}
            className={`${baseButtonClass} ${inactiveButtonClass} ${currentPage === totalPages || disabled ? disabledButtonClass : ''}`}
          >
            <Ionicons
              name="chevron-forward"
              size={sizeConfig.icon - 4}
              color={isDark ? '#e5e7eb' : '#374151'}
            />
            <Ionicons
              name="chevron-forward"
              size={sizeConfig.icon - 4}
              color={isDark ? '#e5e7eb' : '#374151'}
              style={{ marginLeft: -8 }}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  }

  // Default variant: full page numbers
  return (
    <View className={`${className}`} style={style} testID={testID}>
      <View className="flex-row items-center gap-1">
        {showFirstLast && (
          <TouchableOpacity
            onPress={handleFirst}
            disabled={currentPage === 1 || disabled}
            className={`${baseButtonClass} ${inactiveButtonClass} ${currentPage === 1 || disabled ? disabledButtonClass : ''}`}
          >
            <Ionicons
              name="play-back"
              size={sizeConfig.icon - 4}
              color={isDark ? '#e5e7eb' : '#374151'}
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handlePrev}
          disabled={!canGoPrev || disabled}
          className={`${baseButtonClass} ${inactiveButtonClass} ${!canGoPrev || disabled ? disabledButtonClass : ''}`}
        >
          <Ionicons
            name="chevron-back"
            size={sizeConfig.icon}
            color={isDark ? '#e5e7eb' : '#374151'}
          />
        </TouchableOpacity>

        {paginationRange.map((page, index) => renderPageButton(page, index))}

        <TouchableOpacity
          onPress={handleNext}
          disabled={!canGoNext || disabled}
          className={`${baseButtonClass} ${inactiveButtonClass} ${!canGoNext || disabled ? disabledButtonClass : ''}`}
        >
          <Ionicons
            name="chevron-forward"
            size={sizeConfig.icon}
            color={isDark ? '#e5e7eb' : '#374151'}
          />
        </TouchableOpacity>
        {showFirstLast && (
          <TouchableOpacity
            onPress={handleLast}
            disabled={currentPage === totalPages || disabled}
            className={`${baseButtonClass} ${inactiveButtonClass} ${currentPage === totalPages || disabled ? disabledButtonClass : ''}`}
          >
            <Ionicons
              name="play-forward"
              size={sizeConfig.icon - 4}
              color={isDark ? '#e5e7eb' : '#374151'}
            />
          </TouchableOpacity>
        )}
      </View>

      {showPageSize && onPageSizeChange && (
        <View className="flex-row items-center gap-2 mt-3">
          <Text
            className={`text-sm ${isDark ? 'text-foreground-dark-muted' : 'text-foreground-muted'}`}
          >
            Show:
          </Text>
          {pageSizeOptions.map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => onPageSizeChange(option)}
              className={`px-3 py-1.5 rounded-lg ${
                pageSize === option
                  ? isDark
                    ? 'bg-primary-500'
                    : 'bg-primary'
                  : isDark
                    ? 'bg-background-dark-tertiary'
                    : 'bg-background-secondary'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  pageSize === option
                    ? 'text-white'
                    : isDark
                      ? 'text-foreground-dark'
                      : 'text-foreground'
                }`}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

// ===========================================
// CONVENIENCE COMPONENTS
// ===========================================

/**
 * SimplePagination - Arrow navigation only
 */
export function SimplePagination(props: PaginationProps) {
  return <Pagination variant="simple" {...props} />;
}

/**
 * CompactPagination - Minimal space usage
 */
export function CompactPagination(props: PaginationProps) {
  return <Pagination variant="compact" {...props} />;
}

/**
 * MinimalPagination - Just arrows and page count
 */
export function MinimalPagination(props: PaginationProps) {
  return <Pagination variant="minimal" {...props} />;
}
