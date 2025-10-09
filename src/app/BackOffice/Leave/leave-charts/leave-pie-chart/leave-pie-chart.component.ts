import { Component, OnInit } from '@angular/core';
import { LeaveStatisticsService } from '../../../../service/leave-statistics.service';
import { HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-leave-pie-chart',
  templateUrl: './leave-pie-chart.component.html',
  styleUrls: ['./leave-pie-chart.component.css']
})
export class LeavePieChartComponent implements OnInit {
  pieChartData: any = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#dc3545', '#28a745', '#ffc107', '#3788d8'],
      hoverBackgroundColor: ['#c82333', '#218838', '#e0a800', '#2c6da8']
    }]
  };

  pieChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: 'Leave Distribution by Type',
        font: {
          size: 16,
          weight: 'bold'
        }
      }
    }
  };

  constructor(private leaveStatsService: LeaveStatisticsService,private authService : AuthService) { }

  ngOnInit() {
    this.loadPieChartData();
  }
  loadPieChartData() {
    const token = this.authService.getToken(); // Assure-toi que ce service existe et fonctionne
  
    if (!token) {
      console.error('Utilisateur non authentifié.');
      return;
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    this.leaveStatsService.getLeaveCountByType(headers).subscribe(data => {
      this.pieChartData.labels = Object.keys(data);
      this.pieChartData.datasets[0].data = Object.values(data);
    });
  }
  
} 