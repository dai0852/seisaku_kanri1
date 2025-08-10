
"use client"

import { useState, useMemo, type ReactNode } from "react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isToday, startOfWeek, addDays, isSameMonth } from "date-fns"
import { ja } from "date-fns/locale"
import { Button } from "./ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader } from "./ui/card"
import { cn } from "@/lib/utils"

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


export function CalendarBase({ getItemsForDate, renderItem, onItemDrop, onDateClick, itemType }: CalendarBaseProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [draggedItem, setDraggedItem] = useState<DraggableItem | null>(null)

  const firstDayOfMonth = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const calendarStartDate = useMemo(() => startOfWeek(firstDayOfMonth), [firstDayOfMonth]);

  const calendarDays = useMemo(() => {
    return Array.from({ length: 42 }).map((_, i) => addDays(calendarStartDate, i));
  }, [calendarStartDate]);


  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: any) => {
    // Prevent drag on touch devices to allow date click
    if ('ontouchstart' in window) {
      e.preventDefault();
      return;
    }
    const draggable: DraggableItem = itemType === 'task' 
        ? { id: item.task.id, projectId: item.project.id, type: 'task' }
        : { id: item.id, type: 'deadline' };
    setDraggedItem(draggable);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", item.id);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, day: Date) => {
    e.preventDefault();
    if (draggedItem) {
        onItemDrop(draggedItem.id, draggedItem.projectId, format(day, "yyyy-MM-dd"));
    }
    setDraggedItem(null);
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
              <div
                key={day.toString()}
                className={cn(
                    "border-r border-b p-2 h-32 relative flex flex-col transition-colors duration-200",
                    isToday(day) ? "bg-primary/5 dark:bg-primary/10" : "",
                    !isCurrentMonth && "text-muted-foreground bg-muted/30",
                    onDateClick ? "cursor-pointer hover:bg-muted/50" : ""
                )}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
                onClick={() => onDateClick?.(dateStr)}
              >
                <time dateTime={dateStr} className={cn("font-semibold", !isCurrentMonth && "opacity-60")}>{format(day, "d")}</time>
                <div className="flex-grow overflow-y-auto space-y-1 mt-1 text-xs">
                    {items.map(item => (
                        <div key={item.id || item.task.id} draggable onDragStart={(e) => handleDragStart(e, item)}>
                            {renderItem(item)}
                        </div>
                    ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
