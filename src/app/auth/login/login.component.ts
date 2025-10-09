import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface LoginResponse {
  username: string;
  password: string;
  role : string;

  // add other user properties as needed
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData = {
    username: '',
    password: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }
  onSubmit(): void {
    this.authService.login(this.loginData).subscribe({
      next: (response: any) => { // or define an interface if you prefer
        console.log('Login successful', response);
        localStorage.setItem('currentUser', JSON.stringify(response));
  
        // ✅ Get role from response.user
        const role = response.user.role;
  
        if (role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else if (role === 'USER') {
          this.router.navigate(['/dashboard']);
        } else {
          // Optional: handle unknown role
          this.router.navigate(['/']);
        }
      },
      error: (error: Error) => {
        console.error('Login failed', error);
      }
    });
  }
  
  
}