import { Component, OnInit } from '@angular/core';
import { Chart, ChartConfiguration, ChartData, ChartType, BarElement, Tooltip, Legend, CategoryScale, LinearScale } from 'chart.js';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit {
  constructor(private http: HttpClient, private authService: AuthService) {
    // Register required Chart.js components
    Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);
  }

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      }
    }
  };

  public barChartData: ChartData<'bar', number[], string | string[]> = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: ['#A5C1DC', '#B7E4C7', '#FEC8D8', '#FFD3B6', '#C7CEEA'], // Soft pastel colors
      hoverBackgroundColor: ['#91B3D2', '#A1D9B6', '#FDB6C7', '#FFC3A4', '#B6BFD8'],
      label: 'Monthly Data'
    }]
  };
  

  public barChartType: ChartType = 'bar';

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
    this.http.get<{ [key: string]: number }>('http://localhost:8081/advance/monthly', { headers: headers })
      .subscribe({
        next: (response) => {
          console.log('Response:', response);
          
          // Define month order
          const monthOrder = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
          ];
          
          // Sort the data according to month order
          const sortedLabels = Object.keys(response).sort(
            (a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b)
          );
          
          this.barChartData = {
            labels: sortedLabels,
            datasets: [{
              data: sortedLabels.map(month => response[month]),
              backgroundColor: '#36A2EB',
              hoverBackgroundColor: '#4BC0C0',
              label: 'Monthly Advances'
            }]
          };
        },
        error: (error) => {
          console.error('Error fetching chart data:', error);
        }
      });
  }
  
}
