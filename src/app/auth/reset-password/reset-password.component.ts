import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  newPassword: string = '';
  confirmPassword: string = '';
  message: string = '';
  error: string = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // Pas besoin de récupérer le token ici
  }
  passwordStrength = {
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  };

  hasMinLength(): boolean {
    return Boolean(this.newPassword) && this.newPassword.length >= 8;
  }

  hasUpperCase(): boolean {
    return Boolean(this.newPassword) && /[A-Z]/.test(this.newPassword);
  }

  hasNumber(): boolean {
    return Boolean(this.newPassword) && /[0-9]/.test(this.newPassword);
  }

  hasSpecialChar(): boolean {
    return Boolean(this.newPassword) && /[!@#$%^&*]/.test(this.newPassword);
  }

  validatePassword(): boolean {
    return this.hasMinLength() && 
           this.hasUpperCase() && 
           this.hasNumber() && 
           this.hasSpecialChar();
  }

  onSubmit() {
    if (!this.newPassword || !this.confirmPassword) {
      this.error = 'Please fill in all fields';
      return;
    }

    if (!this.validatePassword()) {
      this.error = 'Password does not meet security requirements';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match';
      return;
    }

    // Change from userEmail to resetEmail
    const email = localStorage.getItem('resetEmail');
    if (!email) {
      this.error = 'Email not found, please try again';
      return;
    }

    this.authService.resetPassword(email, this.newPassword).subscribe({
      next: (response) => {
        this.message = 'Password reset successful!';
        localStorage.removeItem('resetEmail'); // Change from userEmail to resetEmail
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('Reset password error:', err); // Add error logging
        this.error = err.error?.error || 'Failed to reset password';
      }
    });
  }

  getPasswordStrength(): string {
    const meetsRequirements = [
      this.hasMinLength(),
      this.hasUpperCase(),
      this.hasNumber(),
      this.hasSpecialChar()
    ].filter(Boolean).length;

    if (meetsRequirements <= 1) return 'weak';
    if (meetsRequirements <= 3) return 'medium';
    return 'strong';
  }

  getPasswordStrengthLabel(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'weak': return 'Faible';
      case 'medium': return 'Moyen';
      case 'strong': return 'Fort';
      default: return '';
    }
  }
}