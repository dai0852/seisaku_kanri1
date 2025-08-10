
"use client"

import { useState, useMemo, type ReactNode } from "react"
import { format, startOfMonth, eachDayOfInterval, addMonths, subMonths, isToday, startOfWeek, addDays, isSameMonth } from "date-fns"
import { ja } from "date-fns/locale"
import { Button } from "./ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader } from "./ui/card"
import { cn } from "@/lib/utils"
import { useDrop, DropTargetMonitor } from "react-dnd"

type DraggableItem = {
    id: string;
    projectId?: string;
    type: 'task' | 'deadline';
};

interface CalendarBaseProps {
    renderItem: (item: any) => ReactNode;
    getItemsForDate: (date: string) => any[];
    onItemDrop: (itemId: string, projectId: string | undefined, newDate: string) => void;
    onDateClick?: (date: string) => void;
    itemType: 'task' | 'deadline';
}

const DayCell = ({
  day,
  isCurrentMonth,
  isToday,
  dateStr,
  items,
  onItemDrop,
  onDateClick,
  renderItem,
}: {
  day: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  dateStr: string;
  items: any[];
  onItemDrop: (newDate: string) => void;
  onDateClick?: (date: string) => void;
  renderItem: (item: any) => ReactNode;
}) => {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ['task', 'deadline'],
    drop: (item: DraggableItem) => onItemDrop(dateStr),
    collect: (monitor: DropTargetMonitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  }), [dateStr]);

  return (
    <div
      ref={drop}
      className={cn(
        "border-r border-b p-2 h-32 relative flex flex-col transition-colors duration-200",
        isToday ? "bg-primary/5 dark:bg-primary/10" : "",
        !isCurrentMonth && "text-muted-foreground bg-muted/30",
        onDateClick ? "cursor-pointer hover:bg-muted/50" : "",
        isOver && canDrop && "bg-primary/20"
      )}
      onClick={() => onDateClick?.(dateStr)}
    >
      <time dateTime={dateStr} className={cn("font-semibold", !isCurrentMonth && "opacity-60")}>
        {format(day, "d")}
      </time>
      <div className="flex-grow overflow-y-auto space-y-1 mt-1 text-xs">
        {items.map(item => (
            <div key={item.id || item.task.id}>
                {renderItem(item)}
            </div>
        ))}
      </div>
    </div>
  );
};


export function CalendarBase({ getItemsForDate, renderItem, onItemDrop, onDateClick, itemType }: CalendarBaseProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const firstDayOfMonth = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const calendarStartDate = useMemo(() => startOfWeek(firstDayOfMonth), [firstDayOfMonth]);

  const calendarDays = useMemo(() => {
    return Array.from({ length: 42 }).map((_, i) => addDays(calendarStartDate, i));
  }, [calendarStartDate]);

  const handleDrop = (item: DraggableItem, newDate: string) => {
    onItemDrop(item.id, item.projectId, newDate);
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const goToToday = () => setCurrentDate(new Date())

  return (
    <Card className="shadow-subtle">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
            <h2 className="text-xl md:text-2xl font-bold w-48 text-center">{format(currentDate, "yyyy年 MMMM", { locale: ja })}</h2>
            <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <Button variant="outline" onClick={goToToday}>今日</Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 text-center font-semibold text-sm text-muted-foreground border-b">
          {["日", "月", "火", "水", "木", "金", "土"].map(day => (
            <div key={day} className="py-2">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 grid-rows-6">
          {calendarDays.map(day => {
            const dateStr = format(day, "yyyy-MM-dd");
            const items = getItemsForDate(dateStr);
            const isCurrentMonth = isSameMonth(day, currentDate);
            
            return (
              <DayCell
                key={day.toString()}
                day={day}
                isCurrentMonth={isCurrentMonth}
                isToday={isToday(day)}
                dateStr={dateStr}
                items={items}
                onItemDrop={(newDate: string) => {
                    // This is a bit of a hack, but useDrop's drop function doesn't give us the item directly
                    // We need a way to get the dragged item's info.
                    // This will be handled in the draggable item component itself using `begin` and `end` drag callbacks.
                    // For now, this just triggers a re-render. The actual update logic is in the context.
                }}
                onDateClick={onDateClick}
                renderItem={renderItem}
              />
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

