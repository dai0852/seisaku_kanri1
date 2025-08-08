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
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAppContext } from "@/context/app-context";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";

const projectSchema = z.object({
  name: z.string().min(1, "物件名は必須です"),
  deadline: z.date({ required_error: "納期を選択してください" }),
  salesRep: z.string().min(1, "担当営業は必須です"),
  designer: z.string().min(1, "担当デザイナーは必須です"),
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
  });

  const deadlineValue = watch("deadline");

  const onSubmit: SubmitHandler<ProjectFormValues> = (data) => {
    addProject({ ...data, deadline: format(data.deadline, "yyyy-MM-dd") });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>新規物件を追加</DialogTitle>
            <DialogDescription>
              新しいプロジェクトの詳細を入力してください。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">物件名</Label>
              <Input id="name" {...register("name")} className="col-span-3" />
              {errors.name && <p className="col-span-4 text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deadline" className="text-right">納期</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !deadlineValue && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadlineValue ? format(deadlineValue, "PPP") : <span>日付を選択</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={deadlineValue}
                    onSelect={(date) => setValue("deadline", date as Date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.deadline && <p className="col-span-4 text-sm text-destructive">{errors.deadline.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="salesRep" className="text-right">担当営業</Label>
              <Input id="salesRep" {...register("salesRep")} className="col-span-3" />
              {errors.salesRep && <p className="col-span-4 text-sm text-destructive">{errors.salesRep.message}</p>}
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="designer" className="text-right">担当デザイナー</Label>
              <Input id="designer" {...register("designer")} className="col-span-3" />
              {errors.designer && <p className="col-span-4 text-sm text-destructive">{errors.designer.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
