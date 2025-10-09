import { Component, OnInit } from '@angular/core';
import { PaymentService, PaymentHistoryItem } from '../../../services/payment.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss'],
  providers: [DatePipe]
})
export class PaymentHistoryComponent implements OnInit {
  payments: PaymentHistoryItem[] = [];
  filteredPayments: PaymentHistoryItem[] = [];
  loading = false;
  errorMessage: string | null = null;
  
  filterForm: FormGroup;
  
  // Pour les détails d'un paiement
  selectedPayment: PaymentHistoryItem | null = null;
  
  // Stats
  totalAmount = 0;
  
  constructor(
    private paymentService: PaymentService,
    private fb: FormBuilder,
    private datePipe: DatePipe
  ) {
    this.filterForm = this.fb.group({
      startDate: [''],
      endDate: [''],
      status: ['ALL'],
      searchTerm: ['']
    });
  }

  ngOnInit(): void {
    // Au lieu d'appeler le service API, on initialise avec des données statiques
    this.initializeStaticData();
    
    // S'abonner aux changements de filtres
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadPaymentHistory(): void {
    // Simuler un chargement
    this.loading = true;
    this.errorMessage = null;
    
    // Simuler une requête réseau avec un délai
    setTimeout(() => {
      this.initializeStaticData();
      this.loading = false;
    }, 800);
  }

  // Méthode pour initialiser des données statiques d'historique de paiements
  initializeStaticData(): void {
    console.log('Initialisation des données statiques d\'historique des paiements');
    
    // Simuler un chargement
    this.loading = true;
    this.errorMessage = null;
    
    // Simuler une requête réseau avec un délai
    setTimeout(() => {
      // Générer un ensemble de données statiques
      const staticData: PaymentHistoryItem[] = [
        {
          paymentId: 'pi_1NqXYXKZ6Ga4ZnJ5H8hZfFvV',
          billId: 1,
          billNumber: 'BILL-2023-001',
          date: new Date().toISOString(),
          amount: 1250.50,
          status: 'succeeded',
          paymentMethod: 'Carte bancaire',
          metadata: {
            stockId: 1,
            stockName: 'Matériaux de construction',
            processingDate: new Date().toISOString(),
            paymentMode: 'PAID',
            paymentStatus: 'completed'
          }
        },
        {
          paymentId: 'pi_2MrTF5LN8Hb3CkQ7G9jZdDxW',
          billId: 2,
          billNumber: 'BILL-2023-002',
          date: new Date(Date.now() - 86400000).toISOString(), // Hier
          amount: 850.75,
          status: 'succeeded',
          paymentMethod: 'Virement bancaire',
          metadata: {
            stockId: 2,
            stockName: 'Outillage électrique',
            processingDate: new Date(Date.now() - 86400000).toISOString(),
            paymentMode: 'PAID',
            paymentStatus: 'completed'
          }
        },
        {
          paymentId: 'pi_3KsTG7JN9Lc2DpR8F6kZgBvE',
          billId: 3,
          billNumber: 'BILL-2023-003',
          date: new Date(Date.now() - 172800000).toISOString(), // Avant-hier
          amount: 2350.30,
          status: 'succeeded',
          paymentMethod: 'Chèque',
          metadata: {
            stockId: 3,
            stockName: 'Bois et dérivés',
            processingDate: new Date(Date.now() - 172800000).toISOString(),
            paymentMode: 'PAID',
            paymentStatus: 'completed'
          }
        },
        {
          paymentId: 'pi_4PuVH8KO0Md1EqS9G7lZhCwF',
          billId: 4,
          billNumber: 'BILL-2023-004',
          date: new Date(Date.now() - 259200000).toISOString(), // Il y a 3 jours
          amount: 478.25,
          status: 'processing',
          paymentMethod: 'Carte bancaire',
          metadata: {
            stockId: 4,
            stockName: 'Peinture et revêtements',
            processingDate: new Date(Date.now() - 259200000).toISOString(),
            paymentMode: 'PENDING',
            paymentStatus: 'in_progress'
          }
        },
        {
          paymentId: 'pi_5QvWI9LP1Ne2FrT0H8mZiDxG',
          billId: 5,
          billNumber: 'BILL-2023-005',
          date: new Date(Date.now() - 345600000).toISOString(), // Il y a 4 jours
          amount: 1820.00,
          status: 'requires_payment_method',
          paymentMethod: 'Virement bancaire',
          metadata: {
            stockId: 1,
            stockName: 'Matériaux de construction',
            processingDate: new Date(Date.now() - 345600000).toISOString(),
            paymentMode: 'PENDING',
            paymentStatus: 'waiting'
          }
        },
        {
          paymentId: 'pi_6RwXJ0MQ2Of3GsU1I9nZjEyH',
          billId: 6,
          billNumber: 'BILL-2023-006',
          date: new Date(Date.now() - 432000000).toISOString(), // Il y a 5 jours
          amount: 750.50,
          status: 'canceled',
          paymentMethod: 'Espèces',
          metadata: {
            stockId: 5,
            stockName: 'Quincaillerie',
            processingDate: new Date(Date.now() - 432000000).toISOString(),
            paymentMode: 'CANCELLED',
            paymentStatus: 'canceled'
          }
        },
        {
          paymentId: 'pi_7SxYK1NR3Pg4HtV2J0oZkFzI',
          billId: 7,
          billNumber: 'BILL-2023-007',
          date: new Date(Date.now() - 518400000).toISOString(), // Il y a 6 jours
          amount: 3200.75,
          status: 'succeeded',
          paymentMethod: 'Carte bancaire',
          metadata: {
            stockId: 6,
            stockName: 'Électricité',
            processingDate: new Date(Date.now() - 518400000).toISOString(),
            paymentMode: 'PAID',
            paymentStatus: 'completed'
          }
        },
        {
          paymentId: 'pi_8TyZL2OS4Qh5IuW3K1pZlGyJ',
          billId: 8,
          billNumber: 'BILL-2023-008',
          date: new Date(Date.now() - 604800000).toISOString(), // Il y a 7 jours
          amount: 1450.25,
          status: 'succeeded',
          paymentMethod: 'Virement bancaire',
          metadata: {
            stockId: 7,
            stockName: 'Plomberie',
            processingDate: new Date(Date.now() - 604800000).toISOString(),
            paymentMode: 'PAID',
            paymentStatus: 'completed'
          }
        }
      ];
      
      this.payments = staticData;
      this.filteredPayments = [...staticData];
      this.calculateStats();
      this.loading = false;
    }, 800);
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    
    let filtered = [...this.payments];
    
    // Filtrer par date de début
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate >= startDate;
      });
    }
    
    // Filtrer par date de fin
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      // Ajouter un jour pour inclure toute la journée
      endDate.setDate(endDate.getDate() + 1);
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.date);
        return paymentDate < endDate;
      });
    }
    
    // Filtrer par statut
    if (filters.status !== 'ALL') {
      filtered = filtered.filter(payment => payment.status === filters.status);
    }
    
    // Filtrer par terme de recherche (numéro de facture ou ID de paiement)
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.billNumber.toLowerCase().includes(searchTerm) ||
        payment.paymentId.toLowerCase().includes(searchTerm)
      );
    }
    
    this.filteredPayments = filtered;
    this.calculateStats();
  }

  clearFilters(): void {
    this.filterForm.reset({
      startDate: '',
      endDate: '',
      status: 'ALL',
      searchTerm: ''
    });
  }

  viewPaymentDetails(payment: PaymentHistoryItem): void {
    this.selectedPayment = payment;
  }

  closeDetails(): void {
    this.selectedPayment = null;
  }
  
  getFormattedDate(date: string): string {
    return this.datePipe.transform(date, 'dd/MM/yyyy à HH:mm') || date;
  }
  
  // Calcul des statistiques
  calculateStats(): void {
    this.totalAmount = this.filteredPayments.reduce((sum, payment) => {
      return sum + (payment.amount || 0);
    }, 0);
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'succeeded':
        return 'bg-success';
      case 'processing':
        return 'bg-warning';
      case 'requires_payment_method':
        return 'bg-info';
      case 'canceled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }
  
  getStatusDisplay(status: string): string {
    switch (status) {
      case 'succeeded':
        return 'Réussi';
      case 'processing':
        return 'En cours';
      case 'requires_payment_method':
        return 'En attente';
      case 'canceled':
        return 'Annulé';
      default:
        return status;
    }
  }
  
  exportToCsv(): void {
    if (this.filteredPayments.length === 0) {
      this.errorMessage = "Aucune donnée à exporter";
      return;
    }
    
    // Préparer les en-têtes CSV
    let csvContent = "Date,Numéro de facture,ID Paiement,Montant,Statut\n";
    
    // Ajouter les données
    this.filteredPayments.forEach(payment => {
      const row = [
        this.getFormattedDate(payment.date),
        payment.billNumber,
        payment.paymentId,
        payment.amount.toString(),
        this.getStatusDisplay(payment.status)
      ];
      
      // Échapper les virgules dans les champs
      const formattedRow = row.map(field => {
        if (field.includes(',')) {
          return `"${field}"`;
        }
        return field;
      });
      
      csvContent += formattedRow.join(',') + "\n";
    });
    
    // Créer un Blob et le télécharger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `historique-paiements-${new Date().toISOString().split('T')[0]}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
