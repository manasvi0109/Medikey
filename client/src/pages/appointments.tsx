import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isToday, isTomorrow, addDays, isBefore, isAfter } from "date-fns";
import { CalendarIcon, Clock, Plus, MapPin, Calendar as CalendarIcon2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Appointment, InsertAppointment } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const appointmentFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  appointmentType: z.string().min(1, "Appointment type is required"),
  providerName: z.string().min(1, "Provider name is required"),
  providerType: z.string().optional(),
  location: z.string().optional(),
  appointmentDate: z.date({
    required_error: "Appointment date is required",
  }),
  appointmentTime: z.string().min(1, "Appointment time is required"),
  duration: z.number().positive().optional(),
  reminderSet: z.boolean().default(false),
  notes: z.string().optional(),
});

export default function Appointments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const form = useForm<z.infer<typeof appointmentFormSchema>>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      appointmentType: "",
      providerName: "",
      providerType: "",
      location: "",
      appointmentTime: "",
      duration: 30,
      reminderSet: true,
      notes: "",
    },
  });

  const addAppointmentMutation = useMutation({
    mutationFn: (data: any) => {
      // Format the date and time properly
      const formattedDate = new Date(data.appointmentDate);
      const [hours, minutes] = data.appointmentTime.split(':').map(Number);
      formattedDate.setHours(hours, minutes, 0, 0);

      const appointmentData = {
        ...data,
        appointmentDate: formattedDate.toISOString(),
        reminderTime: data.reminderSet ? addDays(formattedDate, -1).toISOString() : null,
      };

      delete appointmentData.appointmentTime;

      return apiRequest("POST", "/api/appointments", appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      setIsAddModalOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to schedule appointment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: z.infer<typeof appointmentFormSchema>) => {
    addAppointmentMutation.mutate(data);
  };

  // Filter appointments
  const pastAppointments = appointments
    ? appointments
        .filter(app => isBefore(new Date(app.appointmentDate), new Date()))
        .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
    : [];

  const upcomingAppointments = appointments
    ? appointments
        .filter(app => isAfter(new Date(app.appointmentDate), new Date()))
        .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
    : [];

  const todaysAppointments = upcomingAppointments.filter(app => 
    isToday(new Date(app.appointmentDate))
  );

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Appointments</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your medical appointments and follow-ups
          </p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past Appointments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-0">
                        <div className="h-20 bg-gray-100"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {todaysAppointments.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Today</h3>
                      {todaysAppointments.map(appointment => (
                        <AppointmentCard key={appointment.id} appointment={appointment} />
                      ))}
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Upcoming</h3>
                    {upcomingAppointments
                      .filter(app => !isToday(new Date(app.appointmentDate)))
                      .map(appointment => (
                        <AppointmentCard key={appointment.id} appointment={appointment} />
                      ))
                    }
                  </div>
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <CalendarIcon2 className="h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Appointments</h3>
                    <p className="text-gray-500 mb-4">
                      You don't have any upcoming appointments scheduled
                    </p>
                    <Button onClick={() => setIsAddModalOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Schedule Your First Appointment
                    </Button>
                  </div>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="past">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-0">
                        <div className="h-20 bg-gray-100"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : pastAppointments.length > 0 ? (
                <div className="space-y-4">
                  {pastAppointments.map(appointment => (
                    <AppointmentCard key={appointment.id} appointment={appointment} isPast />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <CalendarIcon2 className="h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Past Appointments</h3>
                    <p className="text-gray-500 mb-4">
                      Your past appointment history will appear here
                    </p>
                  </div>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                components={{
                  DayContent: (props) => {
                    const date = props.date;
                    const hasAppointment = appointments?.some(app => {
                      const appDate = new Date(app.appointmentDate);
                      return (
                        date.getDate() === appDate.getDate() &&
                        date.getMonth() === appDate.getMonth() &&
                        date.getFullYear() === appDate.getFullYear()
                      );
                    });

                    return (
                      <div className="relative h-full w-full p-2">
                        <props.day.Component {...props} />
                        {hasAppointment && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full"></div>
                        )}
                      </div>
                    );
                  },
                }}
              />

              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  {date ? format(date, "MMMM d, yyyy") : "Select a date"}
                </h4>
                
                {date && appointments ? (
                  <div>
                    {appointments
                      .filter(app => {
                        const appDate = new Date(app.appointmentDate);
                        return (
                          date.getDate() === appDate.getDate() &&
                          date.getMonth() === appDate.getMonth() &&
                          date.getFullYear() === appDate.getFullYear()
                        );
                      })
                      .map(app => (
                        <div key={app.id} className="mb-2 p-2 bg-gray-50 rounded text-sm">
                          <div className="font-medium">{app.title}</div>
                          <div className="text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(new Date(app.appointmentDate), "h:mm a")}
                          </div>
                        </div>
                      ))}
                    
                    {!appointments.some(app => {
                      const appDate = new Date(app.appointmentDate);
                      return (
                        date.getDate() === appDate.getDate() &&
                        date.getMonth() === appDate.getMonth() &&
                        date.getFullYear() === appDate.getFullYear()
                      );
                    }) && (
                      <div className="text-sm text-gray-500">No appointments on this date</div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Loading appointments...</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Appointment Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Enter the details for your upcoming appointment
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Appointment Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Annual Physical Exam"
                    {...form.register("title")}
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.title.message}</p>
                  )}
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the appointment"
                    {...form.register("description")}
                  />
                </div>
                
                <div>
                  <Label htmlFor="appointmentType">Appointment Type *</Label>
                  <Select onValueChange={(value) => form.setValue("appointmentType", value)}>
                    <SelectTrigger id="appointmentType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checkup">General Checkup</SelectItem>
                      <SelectItem value="specialist">Specialist Visit</SelectItem>
                      <SelectItem value="follow_up">Follow-up</SelectItem>
                      <SelectItem value="test">Lab Test</SelectItem>
                      <SelectItem value="procedure">Procedure</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.appointmentType && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.appointmentType.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="providerName">Provider Name *</Label>
                  <Input
                    id="providerName"
                    placeholder="e.g. Dr. Smith"
                    {...form.register("providerName")}
                  />
                  {form.formState.errors.providerName && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.providerName.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="providerType">Provider Type</Label>
                  <Input
                    id="providerType"
                    placeholder="e.g. Cardiologist"
                    {...form.register("providerType")}
                  />
                </div>
                
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Memorial Hospital"
                    {...form.register("location")}
                  />
                </div>
                
                <div>
                  <Label>Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !form.getValues("appointmentDate") && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.getValues("appointmentDate") ? (
                          format(form.getValues("appointmentDate"), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={form.getValues("appointmentDate")}
                        onSelect={(date) => form.setValue("appointmentDate", date as Date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {form.formState.errors.appointmentDate && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.appointmentDate.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="appointmentTime">Time *</Label>
                  <Input
                    id="appointmentTime"
                    type="time"
                    {...form.register("appointmentTime")}
                  />
                  {form.formState.errors.appointmentTime && (
                    <p className="text-sm text-red-500 mt-1">{form.formState.errors.appointmentTime.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    step="5"
                    placeholder="30"
                    {...form.register("duration", { valueAsNumber: true })}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="reminderSet"
                    className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    {...form.register("reminderSet")}
                  />
                  <Label htmlFor="reminderSet" className="text-sm">Set reminder (1 day before)</Label>
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes about this appointment"
                    {...form.register("notes")}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={addAppointmentMutation.isPending}
              >
                {addAppointmentMutation.isPending ? "Scheduling..." : "Schedule Appointment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AppointmentCard({ appointment, isPast = false }: { appointment: Appointment, isPast?: boolean }) {
  const appointmentDate = new Date(appointment.appointmentDate);
  const isUpcoming = isAfter(appointmentDate, new Date());
  const displayDate = isToday(appointmentDate)
    ? "Today"
    : isTomorrow(appointmentDate)
    ? "Tomorrow"
    : format(appointmentDate, "MMM d, yyyy");

  return (
    <Card className={cn("mb-4", isPast && "opacity-75")}>
      <CardContent className="p-0">
        <div className="flex items-center p-4">
          <div className={cn(
            "flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center",
            isPast 
              ? "bg-gray-100" 
              : appointment.appointmentType === "checkup" 
                ? "bg-primary-100" 
                : appointment.appointmentType === "test" 
                  ? "bg-green-100" 
                  : "bg-blue-100"
          )}>
            {appointment.appointmentType === "checkup" ? (
              <User className={cn("h-6 w-6", isPast ? "text-gray-500" : "text-primary-600")} />
            ) : appointment.appointmentType === "test" ? (
              <svg className={cn("h-6 w-6", isPast ? "text-gray-500" : "text-green-600")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 2H5C3.89543 2 3 2.89543 3 4V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V4C21 2.89543 20.1046 2 19 2Z" />
                <path d="M15 2V7L12 5.5L9 7V2" />
                <line x1="12" y1="11" x2="12" y2="17" />
                <line x1="9" y1="14" x2="15" y2="14" />
              </svg>
            ) : (
              <CalendarIcon2 className={cn("h-6 w-6", isPast ? "text-gray-500" : "text-blue-600")} />
            )}
          </div>
          
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">{appointment.title}</h3>
              <span className={cn(
                "text-xs px-2 py-1 rounded-full", 
                isPast 
                  ? "bg-gray-100 text-gray-800" 
                  : "bg-primary-100 text-primary-800"
              )}>
                {displayDate}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {appointment.providerName}
              {appointment.providerType ? ` (${appointment.providerType})` : ""}
            </div>
            <div className="mt-2 flex items-center text-xs text-gray-500">
              <Clock className="mr-1 h-3 w-3" />
              <span>{format(appointmentDate, "h:mm a")}</span>
              {appointment.duration && (
                <span className="ml-1">• {appointment.duration} mins</span>
              )}
              
              {appointment.location && (
                <>
                  <MapPin className="ml-3 mr-1 h-3 w-3" />
                  <span>{appointment.location}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
