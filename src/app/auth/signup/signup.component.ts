import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

interface SignupResponse {
  id: number;
  username: string;
  email: string;
  // add other properties as needed
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupData = {
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'USER'
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit() {
    console.log('Submitting signup data:', this.signupData); // Debug log
    
    if (this.validateForm()) {
      this.authService.signup(this.signupData).subscribe({
        next: (response) => {
          console.log('Signup successful:', response);
          alert('Registration successful! Please login.');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Signup error:', error);
          alert(error.error?.message || 'Registration failed. Please try again.');
        }
      });
    }
  }

  passwordStrength = {
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  };

  validatePassword(): boolean {
    const password = this.signupData.password;
    
    this.passwordStrength = {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*]/.test(password)
    };

    return Object.values(this.passwordStrength).every(value => value === true);
  }

  private validateForm(): boolean {
    if (!this.signupData.username || !this.signupData.email || !this.signupData.password) {
      alert('Please fill in all required fields');
      return false;
    }

    if (!this.validatePassword()) {
      alert('Password does not meet security requirements');
      return false;
    }

    return true;
  }
}