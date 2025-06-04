import React, { useState, useEffect, useRef } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format, isAfter, startOfDay, subWeeks, isBefore } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ value, onChange }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(value);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [timeInputState, setTimeInputState] = useState<'hour' | 'minute' | null>(null);
  
  // Track if this is the first keystroke after focusing an input
  const [isFirstInput, setIsFirstInput] = useState<boolean>(false);
  
  // Time input refs and states
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hourRef = useRef<HTMLSpanElement>(null);
  const minuteRef = useRef<HTMLSpanElement>(null);
  
  // Limit dates between 2 weeks ago and today
  const minDate = subWeeks(startOfDay(new Date()), 2);
  const maxDate = startOfDay(new Date());
  
  useEffect(() => {
    setSelectedDate(value);
  }, [value]);
  
  const handleDateSelect = (date: Date | undefined): void => {
    if (!date) return;
    
    const newDate = new Date(date);
    newDate.setHours(selectedDate.getHours());
    newDate.setMinutes(selectedDate.getMinutes());
    newDate.setSeconds(0);
    
    setSelectedDate(newDate);
    onChange(newDate);
    setIsDatePickerOpen(false);
  };
  
  const handleTimeClick = (e: React.MouseEvent, part: 'hour' | 'minute'): void => {
    e.stopPropagation();
    setTimeInputState(part);
    setIsFirstInput(true);
    
    // Focus and select the appropriate part
    setTimeout(() => {
      if (part === 'hour' && hourRef.current) {
        hourRef.current.focus();
      } else if (part === 'minute' && minuteRef.current) {
        minuteRef.current.focus();
      }
    }, 0);
  };
  
  const handleHourKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      const digit = parseInt(e.key);
      let newHour = 0;
      
      // If this is the first input after focusing, replace the current hour
      if (isFirstInput) {
        newHour = digit;

        if (digit > 2) {
            // Automatically move to minute input if second digit is not possible
            setTimeInputState('minute');
            setTimeout(() => {
            if (minuteRef.current) {
                minuteRef.current.focus();
                setIsFirstInput(true);
            }
            }, 0);
        }
        else {
            setIsFirstInput(false);
        }
      } else {
        const firstDigit = selectedDate.getHours() % 10;
        
        newHour = firstDigit * 10 + digit;

        if (newHour == 24) {
          newHour = 0;
        }
        else if (newHour > 24) {
            newHour = digit;
        }
        
        // Automatically move to minute input after second digit input
        setTimeInputState('minute');
        setTimeout(() => {
          if (minuteRef.current) {
            minuteRef.current.focus();
            setIsFirstInput(true);
          }
        }, 0);
      }
      
      // Update the date
      const newDate = new Date(selectedDate);
      newDate.setHours(newHour);
      setSelectedDate(newDate);
      onChange(newDate);
      
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      // Increment/decrement hour
      const hour = selectedDate.getHours();
      let newHour = hour;
      
      if (e.key === 'ArrowUp') {
        newHour = (hour + 1) % 24;
      } else {
        newHour = (hour - 1 + 24) % 24;
      }
      
      const newDate = new Date(selectedDate);
      newDate.setHours(newHour);
      setSelectedDate(newDate);
      onChange(newDate);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      // Move to minutes
      setTimeInputState('minute');
      setTimeout(() => {
        if (minuteRef.current) {
          minuteRef.current.focus();
          setIsFirstInput(true);
        }
      }, 0);
    } else if (e.key === 'Tab') {
      // Handle tabbing between fields
      if (e.shiftKey) {
        // Do nothing as hour is the first field
      } else {
        setTimeInputState('minute');
        e.preventDefault();
        setTimeout(() => {
          if (minuteRef.current) {
            minuteRef.current.focus();
            setIsFirstInput(true);
          }
        }, 0);
      }
    }
  };
  
  const handleMinuteKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      const digit = parseInt(e.key);
      let newMinute = 0;
      
      // If this is the first input after focusing, replace the current minute
      if (isFirstInput) {
        newMinute = digit;

        // Only set first input to false if digit is not > 5
        if (digit > 5) {
            setTimeInputState(null);
            setTimeout(() => {
                if (minuteRef.current) {
                  minuteRef.current.blur();
                }
            }, 0);
        }
        else {
            setIsFirstInput(false);
        }
        
      } else {
        // For the second digit, we need to validate the combination
        const currentMinute = selectedDate.getMinutes();
        const firstDigit = currentMinute % 10;

        newMinute = firstDigit * 10 + digit;
        
        // Move focus out of time input
        setTimeInputState(null);
        setTimeout(() => {
            if (minuteRef.current) {
              minuteRef.current.blur();
            }
        }, 0);
      }
      
      // Update the date
      const newDate = new Date(selectedDate);
      newDate.setMinutes(newMinute);
      setSelectedDate(newDate);
      onChange(newDate);

    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      // Increment/decrement minute
      const minute = selectedDate.getMinutes();
      let newMinute = minute;
      
      if (e.key === 'ArrowUp') {
        newMinute = (minute + 1) % 60;
      } else {
        newMinute = (minute - 1 + 60) % 60;
      }
      
      const newDate = new Date(selectedDate);
      newDate.setMinutes(newMinute);
      setSelectedDate(newDate);
      onChange(newDate);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      // Move to hours
      setTimeInputState('hour');
      setTimeout(() => {
        if (hourRef.current) {
          hourRef.current.focus();
          setIsFirstInput(true);
        }
      }, 0);
    } else if (e.key === 'Tab') {
      // Handle tabbing between fields
      if (e.shiftKey) {
        setTimeInputState('hour');
        e.preventDefault();
        setTimeout(() => {
          if (hourRef.current) {
            hourRef.current.focus();
            setIsFirstInput(true);
          }
        }, 0);
      } else {
        // Move focus away from time input
        setTimeInputState(null);
      }
    }
  };
  
  const handleTimeBlur = (): void => {
    // Only clear the input state if we're not jumping between time parts
    setTimeout(() => {
      // Check if any time parts have focus
      const activeElement = document.activeElement;
      if (
        activeElement !== hourRef.current && 
        activeElement !== minuteRef.current
      ) {
        setTimeInputState(null);
        setIsFirstInput(false);
      }
    }, 100);
  };
  
  // Format hours with padding to ensure 2 digits
  const formatHours = (date: Date): string => {
    return date.getHours().toString().padStart(2, '0');
  };
  
  // Format minutes with padding to ensure 2 digits
  const formatMinutes = (date: Date): string => {
    return date.getMinutes().toString().padStart(2, '0');
  };
  
  return (
    <div className="flex w-full border rounded-md overflow-hidden">
      {/* Date section with Popover */}
      <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen} modal={true}>
        <PopoverTrigger asChild>
          <button 
            ref={buttonRef}
            className="flex items-center px-3 py-2 hover:bg-accent flex-grow text-left"
            type="button"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{format(selectedDate, "MMMM d, yyyy")}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => 
              isBefore(date, minDate) || isAfter(date, maxDate)
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      {/* Separator */}
      <div className="self-stretch flex items-center text-muted-foreground">|</div>
      
      {/* Time section */}
      <div className="flex items-center px-3 py-2">
        <span 
          ref={hourRef}
          onClick={(e) => handleTimeClick(e, 'hour')}
          onBlur={handleTimeBlur}
          onKeyDown={handleHourKeyDown}
          tabIndex={0}
          className={cn(
            "outline-none rounded-sm px-1 py-0.5 min-w-[2ch] inline-block text-center",
            timeInputState === 'hour' ? "bg-accent-foreground text-accent" : "hover:bg-accent"
          )}
        >
          {formatHours(selectedDate)}
        </span>
        <span className="px-0.5">:</span>
        <span 
            ref={minuteRef}
            onClick={(e) => handleTimeClick(e, 'minute')}
            onBlur={handleTimeBlur}
            onKeyDown={handleMinuteKeyDown}
            tabIndex={0}
            className={cn(
                "outline-none rounded-sm px-1 py-0.5 min-w-[2ch] inline-block text-center",
                timeInputState === 'minute' ? "bg-accent-foreground text-accent" : "hover:bg-accent"
            )}
        >
          {formatMinutes(selectedDate)}
        </span>
      </div>
    </div>
  );
};

export default DateTimePicker;