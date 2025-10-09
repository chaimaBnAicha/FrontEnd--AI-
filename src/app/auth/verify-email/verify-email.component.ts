import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  message: string = '';
  error: string = '';
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (token) {
      this.verifyEmail(token);
    } else {
      this.error = 'Invalid verification link';
      this.isLoading = false;
    }
  }

  private verifyEmail(token: string) {
    this.authService.verifyEmail(token).subscribe({
      next: (response) => {
        this.message = 'Email verified successfully! You can now login.';
        this.isLoading = false;
        setTimeout(() => this.router.navigate(['/reset-password']), 3000);
      },
      error: (error) => {
        this.error = error.error?.message || 'Verification failed';
        this.isLoading = false;
      }
    });
  }
}