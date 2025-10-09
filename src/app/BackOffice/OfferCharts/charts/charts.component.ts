import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartType } from 'chart.js';
import { registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.css']
})
export class ChartsComponent implements OnInit, AfterViewInit {
  @ViewChild('lineChart') lineChartCanvas!: ElementRef;
  @ViewChild('insuranceStatusChart') insuranceStatusChartCanvas!: ElementRef;
  
  statusData: any[] = [];
  typeData: any[] = [];
  labels: string[] = [];
  chartData: any = null;
  insuranceStatusData: any[] = [];
  view: [number, number] = [400, 300];
  chart: Chart | null = null;
  insuranceStatusChart: Chart | null = null;
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  insuranceChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'right'
      }
    }
  };

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    // Diagramme circulaire (Statut des offres)
    this.http.get('http://localhost:8081/offer/status-count').subscribe((data: any) => {
      this.statusData = Object.keys(data).map(key => ({ name: key, value: data[key] }));
    });

    // Diagramme à barres (Type des offres)
    this.http.get('http://localhost:8081/offer/type-count').subscribe((data: any) => {
      this.typeData = Object.keys(data).map(key => ({ name: key, value: data[key] }));
    });

    // Graphique sinusoïdal (Offres par mois)
    this.http.get('http://localhost:8081/offer/monthly-count').subscribe((data: any) => {
      this.labels = Object.keys(data);
      this.chartData = {
        labels: this.labels,
        datasets: [{
          label: 'Monthly offers',
          data: Object.values(data),
          borderColor: '#42A5F5',
          backgroundColor: 'rgba(66, 165, 245, 0.1)',
          fill: true,
          tension: 0.4
        }]
      };
      this.initializeChart();
    });

    // Insurance Status Chart
    this.loadInsuranceStatusData();
  }

  loadInsuranceStatusData(): void {
    this.http.get('http://localhost:8081/Insurance/status-count').subscribe((data: any) => {
      this.insuranceStatusData = Object.keys(data).map(key => ({
        name: key,
        value: data[key]
      }));
      this.initializeInsuranceStatusChart();
    });
  }

  ngAfterViewInit() {
    // The charts will be initialized when data is loaded
  }

  private initializeChart() {
    if (this.chartData && this.lineChartCanvas) {
      if (this.chart) {
        this.chart.destroy();
      }

      this.chart = new Chart(this.lineChartCanvas.nativeElement, {
        type: 'line',
        data: this.chartData,
        options: this.chartOptions
      });
    }
  }

  private initializeInsuranceStatusChart(): void {
    if (this.insuranceStatusChartCanvas) {
      if (this.insuranceStatusChart) {
        this.insuranceStatusChart.destroy();
      }

      const chartData = {
        labels: this.insuranceStatusData.map(item => item.name),
        datasets: [{
          data: this.insuranceStatusData.map(item => item.value),
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)', // Valid
            'rgba(255, 99, 132, 0.6)'  // Expired
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1
        }]
      };

      this.insuranceStatusChart = new Chart(this.insuranceStatusChartCanvas.nativeElement, {
        type: 'pie',
        data: chartData,
        options: this.insuranceChartOptions
      });
    }
  }
}
