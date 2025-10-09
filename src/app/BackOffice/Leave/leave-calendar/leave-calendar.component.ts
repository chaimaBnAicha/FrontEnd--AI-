import { Component, OnInit } from '@angular/core';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import { LeaveService } from '../../../service/leave.service';
import { Leave } from '../../../models/leave.model';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LeaveDetailsModalComponent } from '../leave-details-modal/leave-details-modal.component';

@Component({
  selector: 'app-leave-calendar',
  templateUrl: './leave-calendar.component.html',
  styleUrls: ['./leave-calendar.component.css']
})
export class LeaveCalendarComponent implements OnInit {
  selectedLeave: any = null;
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    eventClick: (info) => {
      const modalRef = this.modalService.open(LeaveDetailsModalComponent, {
        centered: true,
        size: 'lg'
      });
      // Format the dates before passing to modal
      const leaveData = {
        ...info.event.extendedProps,
        start_date: info.event.start,
        end_date: info.event.end || info.event.start,
        type: info.event.extendedProps['type']
      };
      modalRef.componentInstance.leave = leaveData;
    },
    events: (info, successCallback, failureCallback) => {
      this.leaveService.getAllApprovedLeaves().subscribe({
        next: (leaves: any[]) => {
          const events = leaves.map(leave => ({
            title: `${leave.type}`,
            start: new Date(leave.start_date),
            end: new Date(leave.end_date),
            backgroundColor: this.getEventColor(leave.type),
            extendedProps: {
              ...leave,
              type: leave.type,
              status: leave.status,
              reason: leave.reason,
              documentAttachement: leave.documentAttachement
            }
          }));
          successCallback(events);
        },
        error: (error) => {
          console.error('Error fetching leaves:', error);
          failureCallback(error);
        }
      });
    }
  };

  constructor(
    private modalService: NgbModal,
    private leaveService: LeaveService
  ) {}

  ngOnInit() {
    this.loadApprovedLeaves();
  }

  handleEventClick(info: EventClickArg) {
    this.selectedLeave = {
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
      reason: info.event.extendedProps['reason'],
      type: info.event.extendedProps['type'],
      status: info.event.extendedProps['status']
    };
    this.openModal();
  }

  openModal() {
    const modalRef = this.modalService.open(LeaveDetailsModalComponent, {
      size: 'lg',
      centered: true
    });
    modalRef.componentInstance.leave = this.selectedLeave;
  }

  loadApprovedLeaves() {
    this.leaveService.getLeaves().subscribe({
      next: (leaves) => {
        const approvedLeaves = leaves.filter(leave => leave.status === 'Approved');
        this.calendarOptions.events = approvedLeaves.map(leave => ({
          title: `Leave: ${leave.type}`,
          start: new Date(leave.start_date),
          end: new Date(leave.end_date),
          backgroundColor: '#28a745',
          borderColor: '#28a745',
          extendedProps: {
            reason: leave.reason,
            type: leave.type,
            status: leave.status
          }
        }));
      },
      error: (error) => {
        console.error('Error loading leaves:', error);
      }
    });
  }

  private getEventColor(leaveType: string): string {
    switch (leaveType) {
      case 'Sick Leave':
        return '#dc3545';
      case 'Unpaid Leave':
        return '#28a745';
      case 'Emergency Leave':
        return '#ffc107';
      default:
        return '#3788d8';
    }
  }
} 