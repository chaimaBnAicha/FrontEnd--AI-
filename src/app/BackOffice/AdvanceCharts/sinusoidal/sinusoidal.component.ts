import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { CategoryScale, Chart, ChartConfiguration, ChartData, ChartType, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sinusoidal',
  templateUrl: './sinusoidal.component.html',
  styleUrls: ['./sinusoidal.component.css']
})
export class SinusoidalComponent {
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  public sinusoidalChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    }
  };

  public sinusoidalChartData: ChartData<'line', number[], string | string[]> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Daily Advance Requests Amount',
      borderColor: '#7F56D9', // Modern purple-blue gradient
      backgroundColor: 'rgba(127, 86, 217, 0.2)', // Light transparent fill
      pointBackgroundColor: '#7F56D9', // Points in the same color
      pointBorderColor: '#FFFFFF', // White borders around points
      pointHoverBackgroundColor: '#5E3BEE', // Darker hover color
      pointHoverBorderColor: '#FFFFFF',
      fill: true,
      tension: 0.4 // Smooth curve effect
      
    }]
  };
  

  public sinusoidalChartType: ChartType = 'line';

  constructor(private http: HttpClient, private authService: AuthService) {
    Chart.register(LineElement, CategoryScale, LinearScale, Title, Tooltip, Legend, PointElement);
  }

  ngOnInit(): void {
    this.fetchData();
  }
  fetchData(): void {
    const token = this.authService.getToken();  // Retrieve the token
    
    if (!token) {
      console.error('Utilisateur non authentifié.');
      return; // Exit the function if no token is found
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`  // Add the token to the headers
    });
  
    // Make the HTTP GET request with the token in the headers
    this.http.get<{ [key: string]: number }>('http://localhost:8081/advance/sinusoidal', { headers: headers })
      .subscribe({
        next: (response) => {
          console.log('Response:', response);
  
          const labels = Object.keys(response);
          const data = Object.values(response);
  
          // Update chart data
          this.sinusoidalChartData.labels = labels;
          this.sinusoidalChartData.datasets[0].data = data;
  
          // Force Angular to detect changes
          setTimeout(() => {
            this.chart?.update();
          });
        },
        error: (error) => {
          console.error('Error fetching chart data:', error);
        }
      });
  }
  
  
}
