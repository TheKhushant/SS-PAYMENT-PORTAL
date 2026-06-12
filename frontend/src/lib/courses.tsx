import { useState } from "react";
import { useData, inr } from "@/lib/store";
import type { Course, DurationMonths } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";

const ALL_DURATIONS: DurationMonths[] = [1, 2, 3, 6];

export default function CoursesPage() {
  const { courses, updateCourse, addCourse } = useData();
  const [editing, setEditing] = useState<Course | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Courses"
        description={`${courses.length} courses configured`}
        actions={<Button onClick={() => { setEditing(null); setOpen(true); }}><Plus className="mr-2 size-4" /> New Course</Button>}
      />

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {courses.map((c) => (
          <Card key={c._id} className="shadow-soft">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{c.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{c.description}</CardDescription>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => { setEditing(c); setOpen(true); }}
                >
                  <Pencil className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {ALL_DURATIONS.map((d) => (
                  <div key={d} className="rounded-lg border p-2.5">
                    <div className="text-xs text-muted-foreground">{d} Month{d > 1 ? "s" : ""}</div>
                    <div className="text-base font-semibold mt-0.5">{inr(c.pricing?.[d] ?? 0)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card> 
        ))}
      </div>

      <CourseDialog
        open={open}
        onOpenChange={setOpen}
        course={editing}
        onSave={(data) => {
          if (editing) { 
            updateCourse(editing._id, data); 
            toast.success("Course updated"); 
          } else { 
            addCourse({ ...data, durations: ALL_DURATIONS }); 
            toast.success("Course created"); 
          }
        }}
      />
    </>
  );
}

function CourseDialog({
  open, 
  onOpenChange, 
  course, 
  onSave,
}: {
  open: boolean; 
  onOpenChange: (o: boolean) => void;
  course: Course | null;
  onSave: (data: Omit<Course, "_id">) => void;
}) {
  const [name, setName] = useState(course?.name ?? "");
  const [desc, setDesc] = useState(course?.description ?? "");
  const defaultPricing: Record<DurationMonths, number> = {
    1: 0,
    2: 0,
    3: 0,
    6: 0,
  };

  const [pricing, setPricing] =
    useState<Record<DurationMonths, number>>(
      course?.pricing
        ? { ...defaultPricing, ...course.pricing }
        : defaultPricing
    );

  // Reset form when dialog opens with new course data
  const handleOpenChange = (o: boolean) => {
    if (o && course) {
      setName(course.name);
      setDesc(course.description ?? "");
      setPricing({
        1: 0,
        2: 0,
        3: 0,
        6: 0,
        ...course.pricing,
      });
    } else if (o) {
      setName("");
      setDesc("");
      setPricing({ 1: 0, 2: 0, 3: 0, 6: 0 });
    }
    onOpenChange(o);
  };

  const handleSave = () => {
    if (!name.trim()) return toast.error("Course name is required");
    onSave({ 
      name: name.trim(), 
      description: desc.trim(), 
      durations: ALL_DURATIONS, 
      pricing 
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{course ? "Edit Course" : "New Course"}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Course Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={2} value={desc} onChange={(e) => setDesc(e.target.value)} />
          </div>
          
          <div>
            <Label className="mb-2 block">Fee Structure</Label>
            <div className="grid grid-cols-2 gap-3">
              {ALL_DURATIONS.map((d) => (
                <div key={d} className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    {d} Month{d > 1 ? "s" : ""}
                  </Label>
                  <Input
                    type="number"
                    value={pricing[d] ?? 0}
                    onChange={(e) => setPricing((p) => ({ ...p, [d]: Number(e.target.value) }))}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}