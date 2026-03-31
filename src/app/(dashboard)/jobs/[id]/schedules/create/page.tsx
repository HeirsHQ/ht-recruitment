"use client";

import { useParams, useRouter } from "next/navigation";
import { useFormik } from "formik";
import { toast } from "sonner";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ACTIVITY_PRIORITY_LIST, ACTIVITY_TYPE_LIST, MEETING_TYPE_LIST } from "@/constants/activity";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateActivityDto } from "@/types";

const initialValues: CreateActivityDto = {
  title: "",
  description: "",
  startDate: undefined,
  endDate: undefined,
  type: "",
  jobId: "",
  meetingType: "",
  location: "",
  meetingUrl: "",
  priority: "",
};

const Page = () => {
  const id = useParams().id as string;
  const router = useRouter();

  const { handleChange, handleSubmit, setFieldValue, values } = useFormik({
    initialValues: { ...initialValues, jobId: id },
    onSubmit: () => {
      toast.success("Activity scheduled successfully");
      router.push(`/jobs/${id}`);
    },
  });

  const showLocationField = values.meetingType === "in-person";
  const showMeetingUrlField = values.meetingType === "video" || values.meetingType === "phone";

  return (
    <div className="space-y-6 p-6">
      <div className="">
        <p className="text-lg font-semibold">Schedule Activity</p>
        <p className="text-sm text-gray-600">Create a new activity for this job</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border p-6">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            className="w-full"
            name="title"
            value={values.title}
            onChange={handleChange}
            placeholder="Activity title"
          />
        </div>
        <div className="grid w-full grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <DatePicker
              onValueChange={(value) => setFieldValue("startDate", value)}
              type="single"
              value={values.startDate}
            />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <DatePicker
              onValueChange={(value) => setFieldValue("endDate", value)}
              type="single"
              value={values.endDate}
              minDate={values.startDate}
            />
          </div>
        </div>
        <div className="grid w-full grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Meeting Type</Label>
            <Select value={values.meetingType} onValueChange={(value) => setFieldValue("meetingType", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select meeting type" />
              </SelectTrigger>
              <SelectContent>
                {MEETING_TYPE_LIST.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            {showLocationField && (
              <>
                <Label>Location</Label>
                <Input
                  className="w-full"
                  name="location"
                  value={values.location}
                  onChange={handleChange}
                  placeholder="Enter location"
                />
              </>
            )}
            {showMeetingUrlField && (
              <>
                <Label>Meeting URL</Label>
                <Input
                  className="w-full"
                  name="meetingUrl"
                  value={values.meetingUrl}
                  onChange={handleChange}
                  placeholder="https://meet.example.com/..."
                />
              </>
            )}
            {!showLocationField && !showMeetingUrlField && (
              <>
                <Label>Location/URL</Label>
                <Input className="w-full" disabled placeholder="Select a meeting type first" />
              </>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            name="description"
            value={values.description}
            onChange={handleChange}
            placeholder="Describe the activity..."
            rows={4}
          />
        </div>
        <div className="grid w-full grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={values.type} onValueChange={(value) => setFieldValue("type", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TYPE_LIST.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={values.priority} onValueChange={(value) => setFieldValue("priority", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_PRIORITY_LIST.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex w-full items-center justify-end gap-x-6">
          <Button type="button" size="sm" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" size="sm">
            Create Activity
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Page;
