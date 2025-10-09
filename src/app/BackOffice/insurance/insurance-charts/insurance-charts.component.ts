import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { registerables } from 'chart.js';
import { AuthService } from 'src/app/services/auth.service';

Chart.register(...registerables);

@Component({
  selector: 'app-insurance-charts',
  templateUrl: './insurance-charts.component.html',
  styleUrls: ['./insurance-charts.component.css']
})
export class InsuranceChartsComponent implements OnInit, AfterViewInit {
  @ViewChild('statusChart') statusChartCanvas!: ElementRef;
  @ViewChild('categoryChart') categoryChartCanvas!: ElementRef;
  @ViewChild('monthlyChart') monthlyChartCanvas!: ElementRef;
  
  statusData: any[] = [];
  chart: Chart<'doughnut', number[], string> | null = null;
  categoryChart: Chart<'bar', number[], string> | null = null;
  monthlyChart: Chart<'line', number[], string> | null = null;

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right'
      }
    }
  };

  categoryData: any[] = [];
  monthlyData: any[] = [];

  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  constructor(private http: HttpClient, private authService : AuthService) { }

  ngOnInit(): void {
    this.loadStatusData();
    this.loadCategoryData();
    this.loadMonthlyData();
  }
  
  ngAfterViewInit(): void {
    // This ensures Canvas elements are available
    setTimeout(() => {
      this.initializeCharts();
    }, 500);
  }
  
  private initializeCharts(): void {
    this.initializeStatusChart();
    this.initializeCategoryChart();
    this.initializeMonthlyChart();
  }

  loadStatusData(): void {
    // Assuming you have an AuthService that provides the token
    const token = this.authService.getToken(); // Replace this with the actual method to get the token

    // Set headers with the token for the request
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Make the HTTP request with the headers
    this.http.get('http://localhost:8081/Insurance/status-count', { headers }).subscribe((data: any) => {
      this.statusData = Object.keys(data).map(key => ({
        name: key,
        value: data[key]
      }));
      this.initializeStatusChart();
    });
  }

  
  loadCategoryData(): void {
    const token = this.authService.getToken(); // Get the token from your AuthService

    // Set headers with the token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Make the HTTP request with the token in the headers
    this.http.get('http://localhost:8081/Insurance/category-count', { headers }).subscribe((data: any) => {
      this.categoryData = Object.keys(data).map(key => ({
        name: key,
        value: data[key]
      }));

      if (this.categoryChartCanvas) {
        this.initializeCategoryChart();
      }
    });
  }
  
  loadMonthlyData(): void {
    const token = this.authService.getToken(); // Get the token from your AuthService

    // Set headers with the token
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    // Make the HTTP request with the token in the headers
    this.http.get('http://localhost:8081/Insurance/monthly-count', { headers }).subscribe((data: any) => {
      // Convert numeric months to month names
      this.monthlyData = Object.keys(data).map(key => ({
        month: parseInt(key),
        name: this.monthNames[parseInt(key) - 1],
        value: data[key]
      })).sort((a, b) => a.month - b.month); // Sort by month number

      if (this.monthlyChartCanvas) {
        this.initializeMonthlyChart();
      }
    });
  }
  private initializeStatusChart(): void {
    if (this.statusChartCanvas) {
      // Destroy existing chart if it exists
      if (this.chart) {
        this.chart.destroy();
      }

      const chartData = {
        labels: this.statusData.map(item => item.name),
        datasets: [{
          data: this.statusData.map(item => item.value),
          backgroundColor: [
            'rgba(46, 184, 92, 0.8)', // Valid - more vibrant green
            'rgba(220, 53, 69, 0.8)'  // Expired - more vibrant red
          ],
          borderColor: [
            'rgba(46, 184, 92, 1)',
            'rgba(220, 53, 69, 1)'
          ],
          borderWidth: 2,
          hoverOffset: 10,
          hoverBorderWidth: 3
        }]
      };

      // Create new chart
      this.chart = new Chart(this.statusChartCanvas.nativeElement, {
        type: 'doughnut', // Change to doughnut for more modern look
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%', // Doughnut hole size
          plugins: {
            legend: {
              display: true,
              position: 'right',
              labels: {
                font: {
                  size: 14,
                  weight: 'bold'
                },
                padding: 20,
                usePointStyle: true,
                pointStyle: 'circle'
              }
            },
            title: {
              display: true,
              text: 'Insurance Status Distribution',
              font: {
                size: 18,
                weight: 'bold'
              },
              padding: {
                top: 10,
                bottom: 20
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = Number(context.raw) || 0;
                  const total = context.dataset.data.reduce((acc: number, curr: number) => acc + Number(curr), 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} (${percentage}%)`;
                }
              },
              padding: 12,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleFont: {
                size: 14
              },
              bodyFont: {
                size: 14
              }
            }
          },
          animation: {
            animateScale: true,
            animateRotate: true,
            duration: 2000
          }
        }
      });
    }
  }
  
  private initializeCategoryChart(): void {
    if (this.categoryChartCanvas && this.categoryData.length > 0) {
      // Destroy existing chart if it exists
      if (this.categoryChart) {
        this.categoryChart.destroy();
      }

      const chartData = {
        labels: this.categoryData.map(item => item.name),
        datasets: [{
          label: 'Insurances by Category',
          data: this.categoryData.map(item => item.value),
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)', // Blue
            'rgba(255, 206, 86, 0.8)', // Yellow
            'rgba(75, 192, 192, 0.8)', // Green
            'rgba(153, 102, 255, 0.8)', // Purple
            'rgba(255, 99, 132, 0.8)'  // Red
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 2,
          hoverBorderWidth: 3
        }]
      };

      // Create new bar chart
      this.categoryChart = new Chart(this.categoryChartCanvas.nativeElement, {
        type: 'bar',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                font: {
                  size: 14
                }
              }
            },
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0,
                font: {
                  size: 14
                }
              },
              grid: {
                color: 'rgba(200, 200, 200, 0.3)'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Insurance Count by Category',
              font: {
                size: 18,
                weight: 'bold'
              },
              padding: {
                top: 10,
                bottom: 20
              }
            },
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.dataset.label || '';
                  const value = context.raw || 0;
                  return `${label}: ${value}`;
                }
              },
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              titleFont: {
                size: 14
              },
              bodyFont: {
                size: 14
              },
              padding: 12
            }
          },
          animation: {
            duration: 1500,
            easing: 'easeOutBounce'
          }
        }
      });
    }
  }
  
  private initializeMonthlyChart(): void {
    if (this.monthlyChartCanvas && this.monthlyData.length > 0) {
      // Destroy existing chart if it exists
      if (this.monthlyChart) {
        this.monthlyChart.destroy();
      }

      // Fill missing months with zero values to ensure smooth line
      const completeMonthlyData = [];
      for (let i = 1; i <= 12; i++) {
        const foundMonth = this.monthlyData.find(item => item.month === i);
        if (foundMonth) {
          completeMonthlyData.push(foundMonth);
        } else {
          completeMonthlyData.push({
            month: i,
            name: this.monthNames[i - 1],
            value: 0
          });
        }
      }

      const chartData = {
        labels: completeMonthlyData.map(item => item.name),
        datasets: [{
          label: 'Insurance Count by Month',
          data: completeMonthlyData.map(item => item.value),
          fill: false,
          borderColor: 'rgba(255, 99, 132, 1)',
          tension: 0.4, // Creates smooth sinusoidal-like curves
          pointBackgroundColor: 'rgba(255, 99, 132, 1)',
          pointBorderColor: '#fff',
          pointRadius: 5
        }]
      };

      // Create new line chart with sinusoidal appearance
      this.monthlyChart = new Chart(this.monthlyChartCanvas.nativeElement, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                precision: 0
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Monthly Insurance Distribution'
            }
          }
        }
      });
    }
  }
}