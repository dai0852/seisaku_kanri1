
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppContext } from "@/context/app-context";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar } from "./ui/calendar";
import { DEPARTMENTS, Department, type Project, type Task } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

const taskSchema = z.object({
  name: z.string().min(1, "タスク名は必須です"),
  department: z.enum(DEPARTMENTS),
  dueDate: z.date({ required_error: "期日を選択してください" }),
  notes: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface EditTaskDialogProps {
  project: Project;
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTaskDialog({ project, task, open, onOpenChange }: EditTaskDialogProps) {
  const { updateTask } = useAppContext();
  
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
  });

  useEffect(() => {
    if (task) {
        reset({
            name: task.name,
            department: task.department,
            dueDate: parseISO(task.dueDate),
            notes: task.notes || ""
        });
    }
  }, [task, reset]);

  const dueDateValue = watch("dueDate");

  const onSubmit: SubmitHandler<TaskFormValues> = (data) => {
    updateTask(project.id, task.id, {
        ...data,
        dueDate: format(data.dueDate, "yyyy-MM-dd"),
        notes: data.notes || ""
    });
    onOpenChange(false);
  };
  
  const handleClose = () => {
    onOpenChange(false);
    reset();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>工程タスクを編集</DialogTitle>
            <DialogDescription>
              タスクの詳細を編集してください。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="space-y-2">
                <Label htmlFor="name">タスク名</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
                <Label>担当部署</Label>
                    <Controller
                    control={control}
                    name="department"
                    render={({ field }) => (
                        <Select onValueChange={(value) => field.onChange(value as Department)} value={field.value}>
                            <SelectTrigger>
                                <SelectValue placeholder="部署を選択" />
                            </SelectTrigger>
                            <SelectContent>
                                {DEPARTMENTS.filter(d => d !== '配送課').map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.department && <p className="text-sm text-destructive">{errors.department.message}</p>}
            </div>
             <div className="space-y-2">
                <Label>期日</Label>
                <Controller
                    control={control}
                    name="dueDate"
                    render={({ field }) => (
                    <Popover modal={true}>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP", { locale: ja }) : <span>日付を選択</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => field.onChange(date)}
                            initialFocus
                            locale={ja}
                            />
                        </PopoverContent>
                    </Popover>
                    )}
                />
                {errors.dueDate && <p className="text-sm text-destructive">{errors.dueDate?.message}</p>}
            </div>
            <div className="space-y-2">
                <Label>備考</Label>
                <Textarea {...register("notes")} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>キャンセル</Button>
            <Button type="submit" disabled={!isDirty}>保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
