import { Component, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { MeetingService } from '../../service/meeting.service';
import { MatDialog } from '@angular/material/dialog';
import { MeetingDetailsDialog } from '../meeting-details/meeting-details.dialog';
import { CreateMeetingDialog } from '../create-meeting/create-meeting.dialog';
@Component({
  selector: 'app-meeting-calendar',
  templateUrl: './meeting-calendar.component.html',
  styleUrls: ['./meeting-calendar.component.css']
})
export class MeetingCalendarComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    events: [],
    eventClick: this.handleEventClick.bind(this),
    eventDidMount: (info) => {
      // Add tooltip
      info.el.title = `${info.event.title}\n${info.event.extendedProps['description']}`;    },
    dayMaxEvents: true,
    weekends: true,
    selectable: true,
    selectMirror: true,
    select: this.handleDateSelect.bind(this),
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      meridiem: false
    },
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    businessHours: {
      daysOfWeek: [ 1, 2, 3, 4, 5 ],
      startTime: '08:00',
      endTime: '18:00',
    },
    height: 'auto',
    expandRows: true
  };

  constructor(
    private meetingService: MeetingService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadMeetings();
  }

  handleEventClick(arg: any) {
    const event = arg.event;
    const dialogRef = this.dialog.open(MeetingDetailsDialog, {
      width: '400px',
      data: {
        title: event.title,
        description: event.extendedProps.description,
        start: event.start,
        id: event.id,
        meetingLink: event.extendedProps.meetingLink
      }
    });
  }
  loadMeetings() {
    this.meetingService.getAllMeetings().subscribe({
      next: (meetings) => {
        const events = meetings.map(meeting => ({
          id: meeting.id.toString(),
          title: meeting.subject,
          start: meeting.scheduledTime,
          description: meeting.description,
          backgroundColor: this.getRandomColor(),
          borderColor: 'transparent',
          meetingLink: meeting.meetingLink // Ensure your API returns this field
        }));
        this.calendarOptions.events = events;
      },
      error: (error) => {
        console.error('Error loading meetings:', error);
      }
    });
  }
  
  handleDateSelect(selectInfo: any) {
    // Implement new meeting creation dialog
    const dialogRef = this.dialog.open(CreateMeetingDialog, {
      width: '400px',
      data: {
        start: selectInfo.start,
        end: selectInfo.end
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadMeetings(); // Refresh calendar after new meeting creation
      }
    });
  }

  private getRandomColor(): string {
    const colors = [
      '#2ecc71', '#3498db', '#9b59b6', '#f1c40f', '#e67e22',
      '#1abc9c', '#34495e', '#16a085', '#27ae60', '#2980b9'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}