import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import type { Job } from '../../types';
import { Calendar as CalendarIcon } from 'lucide-react';

interface JobCalendarProps {
  jobs: Job[];
  onSelectJob?: (jobId: string) => void;
  onDateSelect?: (start: string, end: string) => void;
  onEventDrop?: (jobId: string, newStart: string, newEnd: string) => void;
  isLoading?: boolean;
}

export const JobCalendar: React.FC<JobCalendarProps> = ({
  jobs,
  onSelectJob,
  onDateSelect,
  onEventDrop,
  isLoading = false,
}) => {
  const [currentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'>('dayGridMonth');

  const calendarEvents = jobs.map((job) => {
    // Colors matching DESIGN.md: translucent fill + solid left accent
    const colorMap: Record<Job['status'], { bg: string; border: string; text: string }> = {
      pending: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
      scheduled: { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF' },
      in_progress: { bg: '#E0F2FE', border: '#0EA5E9', text: '#0369A1' },
      completed: { bg: '#D1FAE5', border: '#10B981', text: '#065F46' },
      cancelled: { bg: '#F1F5F9', border: '#94A3B8', text: '#475569' },
      overdue: { bg: '#FFE4E6', border: '#F43F5E', text: '#9F1239' },
    };

    const scheme = colorMap[job.status] || colorMap.pending;

    return {
      id: job.id,
      title: `${job.title} • ${job.assignedToName || 'Unassigned'}`,
      start: job.startTime,
      end: job.endTime,
      backgroundColor: scheme.bg,
      borderColor: scheme.border,
      textColor: scheme.text,
      extendedProps: { ...job },
    };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-level-1 hover:shadow-level-2 transition-shadow space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold font-display text-slate-900">Workforce Schedule Timeline</h2>
            <p className="text-xs text-slate-400">Drag to reschedule • Click to view details • Select range to schedule</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[500px] bg-slate-50 animate-pulse rounded-lg flex items-center justify-center text-slate-400">
          Loading Schedule Calendar...
        </div>
      ) : (
        <div className="calendar-container overflow-hidden text-sm">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin] as any}
            initialView={currentView}
            key={currentView}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
            }}
            editable={true}
            selectable={true}
            events={calendarEvents}
            eventClick={(info) => {
              onSelectJob?.(info.event.id);
            }}
            select={(info) => {
              onDateSelect?.(info.startStr, info.endStr);
            }}
            eventDrop={(info) => {
              if (info.event.start && info.event.end) {
                onEventDrop?.(info.event.id, info.event.start.toISOString(), info.event.end.toISOString());
              }
            }}
            height="auto"
          />
        </div>
      )}
    </div>
  );
};
