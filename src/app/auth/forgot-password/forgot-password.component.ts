import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  message: string = '';
  error: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    if (!this.email || !this.validateEmail(this.email)) {
      this.error = 'Please enter a valid email address';
      return;
    }

    this.isLoading = true;
    this.error = '';
    this.message = '';

    this.authService.forgotPassword(this.email).subscribe({
      next: (response: any) => {
        console.log('Password reset response:', response);
        if (response.message) {
          this.message = response.message;
          localStorage.setItem('resetEmail', this.email);
          localStorage.setItem('resetToken', response.token);
          
          setTimeout(() => {
            this.router.navigate(['/reset-password'], {
              queryParams: { 
                email: this.email,
                token: response.token
              }
            });
          }, 2000);
        }
      },
      error: (error) => {
        console.error('Password reset error:', error);
        this.error = error.error?.error || 'Failed to process password reset request';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  }
}