/**
 * DatePicker Component
 *
 * Date and time selection without external dependencies.
 * Uses a simple calendar UI for date selection.
 *
 * @example
 * // Basic date picker
 * <DatePicker
 *   value={date}
 *   onChange={setDate}
 *   label="Select Date"
 * />
 *
 * // Date range picker
 * <DateRangePicker
 *   startDate={startDate}
 *   endDate={endDate}
 *   onStartChange={setStartDate}
 *   onEndChange={setEndDate}
 * />
 *
 * // With min/max dates
 * <DatePicker
 *   value={date}
 *   onChange={setDate}
 *   minDate={new Date()}
 *   maxDate={addDays(new Date(), 30)}
 * />
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ===========================================
// TYPES
// ===========================================

export type DatePickerMode = 'date' | 'month' | 'year';

export interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  format?: (date: Date) => string;
  className?: string;
  style?: ViewStyle;
  testID?: string;
}

export interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onStartChange: (date: Date) => void;
  onEndChange: (date: Date) => void;
  labels?: { start: string; end: string };
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

// ===========================================
// HELPERS
// ===========================================

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isDateInRange(date: Date, minDate?: Date, maxDate?: Date): boolean {
  if (minDate && date < minDate) return false;
  if (maxDate && date > maxDate) return false;
  return true;
}

function defaultFormat(date: Date): string {
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

// ===========================================
// CALENDAR COMPONENT
// ===========================================

interface CalendarProps {
  value?: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  onClose: () => void;
}

function Calendar({ value, onChange, minDate, maxDate, onClose }: CalendarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [viewDate, setViewDate] = useState(value || new Date());
  const [mode, setMode] = useState<DatePickerMode>('date');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDate = (day: number) => {
    const newDate = new Date(year, month, day);
    if (isDateInRange(newDate, minDate, maxDate)) {
      onChange(newDate);
      onClose();
    }
  };

  const handleSelectMonth = (monthIndex: number) => {
    setViewDate(new Date(year, monthIndex, 1));
    setMode('date');
  };

  const handleSelectYear = (selectedYear: number) => {
    setViewDate(new Date(selectedYear, month, 1));
    setMode('month');
  };

  const renderHeader = () => (
    <View className="flex-row items-center justify-between px-2 py-3">
      <TouchableOpacity
        onPress={handlePrevMonth}
        className="p-2"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-back" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setMode(mode === 'date' ? 'month' : mode === 'month' ? 'year' : 'date')}
        className="flex-row items-center"
      >
        <Text
          className={`text-lg font-semibold ${isDark ? 'text-foreground-dark' : 'text-foreground'}`}
        >
          {MONTHS[month]} {year}
        </Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={isDark ? '#9ca3af' : '#6b7280'}
          style={{ marginLeft: 4 }}
        />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleNextMonth}
        className="p-2"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="chevron-forward" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
      </TouchableOpacity>
    </View>
  );

  const renderDays = () => (
    <View className="flex-row mb-2">
      {DAYS.map((day) => (
        <View key={day} className="flex-1 items-center py-2">
          <Text
            className={`text-xs font-medium ${
              isDark ? 'text-foreground-dark-muted' : 'text-foreground-muted'
            }`}
          >
            {day}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderDates = () => {
    const days: React.ReactNode[] = [];
    const today = new Date();

    // Empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} className="flex-1 aspect-square" />);
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected = value && isSameDay(date, value);
      const isToday = isSameDay(date, today);
      const isDisabled = !isDateInRange(date, minDate, maxDate);

      days.push(
        <TouchableOpacity
          key={day}
          onPress={() => handleSelectDate(day)}
          disabled={isDisabled}
          className={`flex-1 aspect-square items-center justify-center ${
            isSelected
              ? isDark
                ? 'bg-primary-500 rounded-full'
                : 'bg-primary rounded-full'
              : isToday
                ? 'bg-primary/10 rounded-full'
                : ''
          }`}
        >
          <Text
            className={`text-base ${
              isSelected
                ? 'text-white font-semibold'
                : isDisabled
                  ? isDark
                    ? 'text-foreground-dark-muted/30'
                    : 'text-foreground-muted/30'
                  : isToday
                    ? isDark
                      ? 'text-primary-400 font-semibold'
                      : 'text-primary font-semibold'
                    : isDark
                      ? 'text-foreground-dark'
                      : 'text-foreground'
            }`}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    // Split into weeks
    const weeks: React.ReactNode[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    // Pad last week if needed
    const lastWeek = weeks[weeks.length - 1];
    while (lastWeek.length < 7) {
      lastWeek.push(<View key={`pad-${lastWeek.length}`} className="flex-1 aspect-square" />);
    }

    return (
      <View>
        {weeks.map((week, index) => (
          <View key={index} className="flex-row">
            {week}
          </View>
        ))}
      </View>
    );
  };

  const renderMonths = () => (
    <View className="flex-row flex-wrap p-2">
      {MONTHS.map((monthName, index) => (
        <TouchableOpacity
          key={monthName}
          onPress={() => handleSelectMonth(index)}
          className={`w-1/3 py-3 items-center ${
            index === month ? (isDark ? 'bg-primary-500 rounded-lg' : 'bg-primary rounded-lg') : ''
          }`}
        >
          <Text
            className={`text-base ${
              index === month
                ? 'text-white font-semibold'
                : isDark
                  ? 'text-foreground-dark'
                  : 'text-foreground'
            }`}
          >
            {monthName.slice(0, 3)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderYears = () => {
    const startYear = Math.floor(year / 12) * 12;
    const years = Array.from({ length: 12 }, (_, i) => startYear + i);

    return (
      <View>
        <View className="flex-row items-center justify-between px-4 py-2">
          <TouchableOpacity onPress={() => setViewDate(new Date(startYear - 12, month, 1))}>
            <Ionicons name="chevron-back" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
          </TouchableOpacity>
          <Text
            className={`text-lg font-semibold ${isDark ? 'text-foreground-dark' : 'text-foreground'}`}
          >
            {startYear} - {startYear + 11}
          </Text>
          <TouchableOpacity onPress={() => setViewDate(new Date(startYear + 12, month, 1))}>
            <Ionicons name="chevron-forward" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
          </TouchableOpacity>
        </View>
        <View className="flex-row flex-wrap p-2">
          {years.map((y) => (
            <TouchableOpacity
              key={y}
              onPress={() => handleSelectYear(y)}
              className={`w-1/3 py-3 items-center ${
                y === year ? (isDark ? 'bg-primary-500 rounded-lg' : 'bg-primary rounded-lg') : ''
              }`}
            >
              <Text
                className={`text-base ${
                  y === year
                    ? 'text-white font-semibold'
                    : isDark
                      ? 'text-foreground-dark'
                      : 'text-foreground'
                }`}
              >
                {y}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View
      className={`rounded-2xl overflow-hidden ${
        isDark ? 'bg-background-dark-secondary' : 'bg-white'
      }`}
      style={{ width: 320 }}
    >
      {mode === 'date' && (
        <>
          {renderHeader()}
          {renderDays()}
          {renderDates()}
        </>
      )}
      {mode === 'month' && (
        <>
          {renderHeader()}
          {renderMonths()}
        </>
      )}
      {mode === 'year' && renderYears()}

      <View className="flex-row justify-end gap-2 p-3 border-t border-border dark:border-border-dark">
        <TouchableOpacity
          onPress={() => {
            onChange(new Date());
            onClose();
          }}
          className="px-4 py-2"
        >
          <Text className={`font-medium ${isDark ? 'text-primary-400' : 'text-primary'}`}>
            Today
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} className="px-4 py-2">
          <Text
            className={`font-medium ${isDark ? 'text-foreground-dark-muted' : 'text-foreground-muted'}`}
          >
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ===========================================
// MAIN DATEPICKER COMPONENT
// ===========================================

export function DatePicker({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  minDate,
  maxDate,
  disabled = false,
  error,
  helperText,
  format = defaultFormat,
  className = '',
  style,
  testID,
}: DatePickerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isOpen, setIsOpen] = useState(false);

  const displayValue = value ? format(value) : placeholder;
  const hasError = !!error;

  const borderColor = hasError ? 'border-danger' : isDark ? 'border-border-dark' : 'border-border';

  return (
    <View className={className} style={style} testID={testID}>
      {label && (
        <Text
          className={`mb-1.5 text-sm font-medium ${
            hasError ? 'text-danger' : isDark ? 'text-foreground-dark' : 'text-foreground'
          }`}
        >
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={`flex-row items-center justify-between px-4 py-3 rounded-xl border ${borderColor} ${
          disabled ? 'opacity-50' : ''
        } ${isDark ? 'bg-background-dark-tertiary' : 'bg-background-secondary'}`}
      >
        <Text
          className={`text-base ${
            value
              ? isDark
                ? 'text-foreground-dark'
                : 'text-foreground'
              : isDark
                ? 'text-foreground-dark-muted'
                : 'text-foreground-muted'
          }`}
        >
          {displayValue}
        </Text>
        <Ionicons name="calendar-outline" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
      </TouchableOpacity>

      {(error || helperText) && (
        <Text
          className={`mt-1.5 text-sm ${
            hasError
              ? 'text-danger'
              : isDark
                ? 'text-foreground-dark-muted'
                : 'text-foreground-muted'
          }`}
        >
          {error || helperText}
        </Text>
      )}

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View className="flex-1 items-center justify-center p-4">
            <TouchableOpacity activeOpacity={1}>
              <Calendar
                value={value}
                onChange={onChange}
                minDate={minDate}
                maxDate={maxDate}
                onClose={() => setIsOpen(false)}
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ===========================================
// DATE RANGE PICKER
// ===========================================

export function DateRangePicker({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  labels = { start: 'Start Date', end: 'End Date' },
  minDate,
  maxDate,
  className = '',
}: DateRangePickerProps) {
  return (
    <View className={`flex-row gap-3 ${className}`}>
      <View className="flex-1">
        <DatePicker
          value={startDate}
          onChange={onStartChange}
          label={labels.start}
          minDate={minDate}
          maxDate={endDate || maxDate}
        />
      </View>
      <View className="flex-1">
        <DatePicker
          value={endDate}
          onChange={onEndChange}
          label={labels.end}
          minDate={startDate || minDate}
          maxDate={maxDate}
        />
      </View>
    </View>
  );
}

// ===========================================
// CONVENIENCE COMPONENTS
// ===========================================

/**
 * BirthdayPicker - Date picker configured for birthdays
 */
export function BirthdayPicker(props: Omit<DatePickerProps, 'maxDate'>) {
  const today = new Date();
  const minAge = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());

  return (
    <DatePicker
      label="Date of Birth"
      placeholder="Select your birthday"
      minDate={minAge}
      maxDate={today}
      format={(date) => `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`}
      {...props}
    />
  );
}

/**
 * FutureDatePicker - Only allows selecting future dates
 */
export function FutureDatePicker(props: Omit<DatePickerProps, 'minDate'>) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return <DatePicker placeholder="Select future date" minDate={tomorrow} {...props} />;
}
