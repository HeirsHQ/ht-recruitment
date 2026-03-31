"use client";

import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar, type DateRange } from "./calendar";
import { cn } from "@/lib";

type SingleDatePickerProps = {
  onValueChange: (date: Date | undefined) => void;
  type: "single";
  value: Date | undefined;
  className?: string;
  label?: string;
  labelClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
};

type RangeDatePickerProps = {
  onValueChange: (range: DateRange) => void;
  type: "range";
  value: DateRange;
  className?: string;
  label?: string;
  labelClassName?: string;
  placeholderFrom?: string;
  placeholderTo?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
};

type Props = SingleDatePickerProps | RangeDatePickerProps;

export const DatePicker = (props: Props) => {
  const { className, label, labelClassName, type, disabled = false, minDate, maxDate, disabledDates } = props;
  const [open, setOpen] = useState(false);

  if (type === "range") {
    const {
      value,
      onValueChange,
      placeholderFrom = "Start date",
      placeholderTo = "End date",
    } = props as RangeDatePickerProps;
    const fromDisplay = value.from ? format(value.from, "MMM dd, yyyy") : "";
    const toDisplay = value.to ? format(value.to, "MMM dd, yyyy") : "";

    const handleRangeSelect = (range: DateRange) => {
      onValueChange(range);
      if (range.from && range.to) {
        setOpen(false);
      }
    };

    return (
      <div className={cn("flex flex-col gap-y-1", className)}>
        {label && <label className={cn("text-sm font-medium text-neutral-700", labelClassName)}>{label}</label>}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="flex items-center gap-x-2">
              <button
                type="button"
                disabled={disabled}
                className={cn(
                  "flex h-10 flex-1 items-center justify-between gap-x-2 rounded-md border border-neutral-300 bg-white px-3 text-sm transition-colors",
                  "focus:border-primary-500 focus:ring-primary-500/20 hover:border-neutral-400 focus:ring-2 focus:outline-none",
                  disabled && "cursor-not-allowed opacity-50",
                  !fromDisplay && "text-neutral-400",
                )}
              >
                <span className="truncate">{fromDisplay || placeholderFrom}</span>
                <CalendarIcon className="size-4 shrink-0 text-neutral-500" />
              </button>
              <span className="text-neutral-400">-</span>
              <button
                type="button"
                disabled={disabled}
                className={cn(
                  "flex h-10 flex-1 items-center justify-between gap-x-2 rounded-md border border-neutral-300 bg-white px-3 text-sm transition-colors",
                  "focus:border-primary-500 focus:ring-primary-500/20 hover:border-neutral-400 focus:ring-2 focus:outline-none",
                  disabled && "cursor-not-allowed opacity-50",
                  !toDisplay && "text-neutral-400",
                )}
              >
                <span className="truncate">{toDisplay || placeholderTo}</span>
                <CalendarIcon className="size-4 shrink-0 text-neutral-500" />
              </button>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <Calendar
              mode="range"
              numberOfMonths={2}
              value={value}
              onSelect={handleRangeSelect}
              minDate={minDate}
              maxDate={maxDate}
              disabledDates={disabledDates}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  const { value, onValueChange, placeholder = "Select date" } = props as SingleDatePickerProps;
  const displayValue = value ? format(value, "MMM dd, yyyy") : "";

  const handleSingleSelect = (date: Date | undefined) => {
    onValueChange(date);
    if (date) {
      setOpen(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-y-1", className)}>
      {label && <label className={cn("text-sm font-medium text-neutral-700", labelClassName)}>{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-10 w-full items-center justify-between gap-x-2 rounded-md border border-neutral-300 bg-white px-3 text-sm transition-colors",
              "focus:border-primary-500 focus:ring-primary-500/20 hover:border-neutral-400 focus:ring-2 focus:outline-none",
              disabled && "cursor-not-allowed opacity-50",
              !displayValue && "text-neutral-400",
            )}
          >
            <span className="truncate">{displayValue || placeholder}</span>
            <CalendarIcon className="size-4 shrink-0 text-neutral-500" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <Calendar
            mode="single"
            value={value}
            onSelect={handleSingleSelect}
            minDate={minDate}
            maxDate={maxDate}
            disabledDates={disabledDates}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
