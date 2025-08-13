"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, useFieldArray, type SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppContext } from "@/context/app-context";
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar } from "./ui/calendar";
import { DEPARTMENTS, Department } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";

const taskSchema = z.object({
  name: z.string().min(1, "タスク名は必須です"),
  department: z.enum(DEPARTMENTS),
  dueDate: z.date({ required_error: "期日を選択してください" }),
  notes: z.string().optional(),
});

const projectSchema = z.object({
  name: z.string().min(1, "物件名は必須です"),
  deadline: z.date({ required_error: "納期を選択してください" }),
  salesRep: z.string().min(1, "担当営業は必須です"),
  designer: z.string().min(1, "担当デザイナーは必須です"),
  link: z.string().url("有効なURLを入力してください").optional().or(z.literal('')),
  notes: z.string().optional(),
  tasks: z.array(taskSchema),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export function AddProjectDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { addProject } = useAppContext();
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      tasks: [],
      link: "",
      notes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tasks",
  });

  const deadlineValue = watch("deadline");

  const onSubmit: SubmitHandler<ProjectFormValues> = (data) => {
    // Manually added tasks
    const formattedTasks = data.tasks.map((task, index) => ({
      ...task,
      id: `task-${Date.now()}-${index}`,
      dueDate: format(task.dueDate, "yyyy-MM-dd"),
      completed: false,
      notes: task.notes || ""
    }));

    // Auto-added delivery task
    const deliveryTask = {
      id: `task-${Date.now()}-delivery`,
      name: "納品",
      department: "配送課" as Department,
      dueDate: format(data.deadline, "yyyy-MM-dd"),
      notes: "",
      completed: false
    };

    addProject({
      ...data,
      deadline: format(data.deadline, "yyyy-MM-dd"),
      tasks: [...formattedTasks, deliveryTask],
    });
    reset();
    setOpen(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown}>
          <DialogHeader>
            <DialogTitle>新規物件を追加</DialogTitle>
            <DialogDescription>
              新しいプロジェクトの詳細と関連タスクを入力してください。
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] p-4">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">物件名</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">納期</Label>
                  <Popover modal={true}>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !deadlineValue && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deadlineValue ? format(deadlineValue, "PPP", { locale: ja }) : <span>日付を選択</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={deadlineValue}
                        onSelect={(date) => setValue("deadline", date as Date)}
                        initialFocus
                        locale={ja}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.deadline && <p className="text-sm text-destructive">{errors.deadline.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salesRep">担当営業</Label>
                  <Input id="salesRep" {...register("salesRep")} />
                  {errors.salesRep && <p className="text-sm text-destructive">{errors.salesRep.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="designer">担当デザイナー</Label>
                  <Input id="designer" {...register("designer")} />
                  {errors.designer && <p className="text-sm text-destructive">{errors.designer.message}</p>}
                </div>
                 <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label htmlFor="link">リンク</Label>
                  <Input id="link" {...register("link")} placeholder="https://example.com" />
                  {errors.link && <p className="text-sm text-destructive">{errors.link.message}</p>}
                </div>
                 <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label htmlFor="notes">備考</Label>
                  <Textarea id="notes" {...register("notes")} />
                  {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">工程タスク</h3>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 border rounded-md relative">
                      <div className="col-span-1 md:col-span-12">
                        <Label>タスク名</Label>
                        <Input {...register(`tasks.${index}.name`)} />
                        {errors.tasks?.[index]?.name && <p className="text-sm text-destructive">{errors.tasks[index]?.name?.message}</p>}
                      </div>
                      <div className="col-span-1 md:col-span-6">
                        <Label>担当部署</Label>
                         <Controller
                            control={control}
                            name={`tasks.${index}.department`}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="部署を選択" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DEPARTMENTS.filter(d => d !== '配送課').map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.tasks?.[index]?.department && <p className="text-sm text-destructive">{errors.tasks[index]?.department?.message}</p>}
                      </div>
                      <div className="col-span-1 md:col-span-6">
                        <Label>期日</Label>
                        <Popover modal={true}>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn("w-full justify-start text-left font-normal", !watch(`tasks.${index}.dueDate`) && "text-muted-foreground")}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {watch(`tasks.${index}.dueDate`) ? format(watch(`tasks.${index}.dueDate`), "PPP", { locale: ja }) : <span>日付を選択</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={watch(`tasks.${index}.dueDate`)}
                                onSelect={(date) => setValue(`tasks.${index}.dueDate`, date as Date)}
                                initialFocus
                                locale={ja}
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.tasks?.[index]?.dueDate && <p className="text-sm text-destructive">{errors.tasks[index]?.dueDate?.message}</p>}
                      </div>
                       <div className="col-span-1 md:col-span-12">
                        <Label>備考</Label>
                        <Textarea {...register(`tasks.${index}.notes`)} />
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-destructive" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                   <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ name: "", department: "営業", dueDate: new Date(), notes: "" })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    タスクを追加
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="pt-4">
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
