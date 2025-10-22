import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { LeaveStatisticsService } from './leave-statistics.service';

describe('LeaveStatisticsService', () => {
  let service: LeaveStatisticsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [LeaveStatisticsService]
    });

    service = TestBed.inject(LeaveStatisticsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getLeaveCountByType', () => {
    it('should return leave count by type data', () => {
      const mockData = {
        'Sick': 10,
        'Unpaid': 5,
        'Emergency': 3
      };

      service.getLeaveCountByType().subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/leave-count-by-type`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should handle errors when fetching leave count by type', () => {
      const mockError = { status: 500, statusText: 'Internal Server Error' };

      service.getLeaveCountByType().subscribe({
        next: () => fail('should have failed with an error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/leave-count-by-type`);
      req.flush('Error fetching leave count by type', mockError);
    });
  });

  describe('getAverageLeaveDuration', () => {
    it('should return average leave duration data', () => {
      const mockData = {
        'Sick': 3.5,
        'Unpaid': 7.2,
        'Emergency': 1.8
      };

      service.getAverageLeaveDuration().subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/average-leave-duration`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should handle errors when fetching average leave duration', () => {
      const mockError = { status: 500, statusText: 'Internal Server Error' };

      service.getAverageLeaveDuration().subscribe({
        next: () => fail('should have failed with an error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/average-leave-duration`);
      req.flush('Error fetching average leave duration', mockError);
    });
  });

  describe('getLeavesByMonth', () => {
    it('should return leaves by month data', () => {
      const mockData = {
        'January': 5,
        'February': 3,
        'March': 7,
        'April': 2,
        'May': 4,
        'June': 8
      };

      service.getLeavesByMonth().subscribe(data => {
        expect(data).toEqual(mockData);
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/leaves-by-month`);
      expect(req.request.method).toBe('GET');
      req.flush(mockData);
    });

    it('should handle errors when fetching leaves by month', () => {
      const mockError = { status: 500, statusText: 'Internal Server Error' };

      service.getLeavesByMonth().subscribe({
        next: () => fail('should have failed with an error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(`${service['apiUrl']}/leaves-by-month`);
      req.flush('Error fetching leaves by month', mockError);
    });
  });
});