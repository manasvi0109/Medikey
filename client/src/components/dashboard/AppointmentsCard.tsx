import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Appointment } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { Calendar, Clock, MapPin, Plus } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

export default function AppointmentsCard() {
  const { data: appointments, isLoading, error } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments/upcoming"],
  });

  const upcomingAppointments = appointments?.slice(0, 3) || [];

  return (
    <Card>
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <CardTitle className="text-lg font-medium leading-6 text-gray-900">
          Upcoming Appointments
        </CardTitle>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Your next {upcomingAppointments.length || 3} scheduled visits
        </p>
      </CardHeader>
      
      <div className="divide-y divide-gray-200">
        {isLoading ? (
          <>
            <AppointmentSkeleton />
            <AppointmentSkeleton />
            <AppointmentSkeleton />
          </>
        ) : error ? (
          <div className="px-6 py-4 text-center">
            <p className="text-red-500 mb-2">Failed to load appointments</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : upcomingAppointments.length > 0 ? (
          upcomingAppointments.map((appointment) => (
            <AppointmentItem key={appointment.id} appointment={appointment} />
          ))
        ) : (
          <div className="px-6 py-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">No upcoming appointments</h3>
            <p className="text-xs text-gray-500 mb-4">
              Schedule your next appointment with your healthcare provider
            </p>
          </div>
        )}
      </div>
      
      <CardContent className="p-0">
        <div className="px-4 py-4 sm:px-6 border-t border-gray-200 bg-gray-50">
          <Link href="/appointments">
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4 text-gray-500" />
              Schedule New Appointment
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function AppointmentItem({ appointment }: { appointment: Appointment }) {
  const appointmentDate = new Date(appointment.appointmentDate);
  
  const displayDate = isToday(appointmentDate)
    ? "Today"
    : isTomorrow(appointmentDate)
    ? "Tomorrow"
    : format(appointmentDate, "MMM d, yyyy");

  return (
    <div className="px-4 py-4 sm:px-6">
      <div className="flex items-center">
        <div 
          className={cn(
            "flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center",
            appointment.appointmentType === "checkup" 
              ? "bg-primary-100" 
              : appointment.appointmentType === "test" 
                ? "bg-green-100" 
                : "bg-blue-100"
          )}
        >
          <AppointmentTypeIcon type={appointment.appointmentType} />
        </div>
        <div className="ml-4 flex-1">
          <div className="text-sm font-medium text-gray-900">{appointment.providerName}</div>
          <div className="text-sm text-gray-500">{appointment.title}</div>
        </div>
        <div className="ml-2 flex-shrink-0">
          <div className="text-sm text-gray-500">{displayDate}</div>
          <div className="text-sm text-gray-500">
            {format(appointmentDate, "h:mm a")}
          </div>
        </div>
      </div>
      
      {appointment.location && (
        <div className="mt-2 ml-14 flex items-center text-xs text-gray-500">
          <MapPin className="mr-1 h-3 w-3" />
          <span>{appointment.location}</span>
        </div>
      )}
    </div>
  );
}

function AppointmentTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "checkup":
      return <Calendar className="h-5 w-5 text-primary-600" />;
    case "test":
      return (
        <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 2H5C3.89543 2 3 2.89543 3 4V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V4C21 2.89543 20.1046 2 19 2Z" />
          <path d="M15 2V7L12 5.5L9 7V2" />
          <line x1="12" y1="11" x2="12" y2="17" />
          <line x1="9" y1="14" x2="15" y2="14" />
        </svg>
      );
    case "follow_up":
      return <Clock className="h-5 w-5 text-blue-600" />;
    default:
      return <Calendar className="h-5 w-5 text-gray-600" />;
  }
}

function AppointmentSkeleton() {
  return (
    <div className="px-4 py-4 sm:px-6">
      <div className="flex items-center">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="ml-4 flex-1">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
        <div className="ml-2 flex-shrink-0">
          <Skeleton className="h-4 w-16 mb-2" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}
