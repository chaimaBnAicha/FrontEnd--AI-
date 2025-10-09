import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BillService } from '../../../services/bill.service';
import { StockService } from '../../../services/stock.service';
import { Status, PaymentMode } from '../../../models/bill.model';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-bill-list',
  templateUrl: './bill-list.component.html',
  styleUrls: ['./bill-list.component.scss']
})
export class BillListComponent implements OnInit {
  bills: any[] = [];
  filteredBills: any[] = [];
  loading = false;
  errorMessage: string | null = null;
  stocksMap: Map<number, any> = new Map();
  
  // Propriétés pour la recherche et le filtrage
  searchTerm: string = '';
  statusFilter: string = 'ALL'; // Pour le filtre de méthode de paiement
  paymentModeFilter: string = 'ALL'; // Pour le filtre de statut de paiement
  
  // Options de filtre basées sur les énums
  statuses = Object.values(Status);
  paymentModes = Object.values(PaymentMode);

  constructor(
    private billService: BillService,
    private stockService: StockService, 
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  // Méthode pour charger toutes les données nécessaires
  loadData(): void {
    this.loading = true;
    
    // Récupérer d'abord tous les stocks pour avoir leurs noms
    this.stockService.getAllStocks().subscribe({
      next: (stocks) => {
        // Stocker les stocks dans une Map pour référence rapide
        stocks.forEach(stock => {
          if (stock && stock.id_stock) {
            this.stocksMap.set(stock.id_stock, stock);
          }
        });
        
        // Une fois les stocks chargés, charger les factures
        this.loadBills();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des stocks:', err);
        this.errorMessage = 'Erreur lors du chargement des stocks';
        this.loading = false;
        // Même en cas d'erreur, essayer de charger les factures
        this.loadBills();
      }
    });
  }

  // Charger les factures
  loadBills(): void {
    this.billService.getAllBills().subscribe({
      next: (data) => {
        console.log('Factures chargées:', data);
        this.bills = data;
        
        // Création d'un tableau de requêtes pour charger les noms de stock associés à chaque facture
        const stockNameRequests = this.bills
          .filter(bill => bill.stock && bill.stock.id_stock)
          .map(bill => {
            return this.billService.getStockNameForBill(bill.id_Bill || 0).pipe(
              map(response => {
                if (response && response.stockName) {
                  // Si la facture a un stock mais que le stock n'est pas dans notre map ou n'a pas de nom défini
                  const stockId = bill.stock?.id_stock;
                  if (stockId) {
                    if (!this.stocksMap.has(stockId) || !this.stocksMap.get(stockId)?.name) {
                      // Ajouter ou mettre à jour le stock dans notre map
                      this.stocksMap.set(stockId, {
                        id_stock: stockId,
                        name: response.stockName
                      });
                    }
                  }
                }
                return response;
              }),
              catchError(error => {
                console.error(`Erreur lors du chargement des infos de stock pour facture ID=${bill.id_Bill}:`, error);
                return of(null);
              })
            );
          });
        
        // Si nous avons des requêtes de noms de stock à effectuer
        if (stockNameRequests.length > 0) {
          // Exécution de toutes les requêtes en parallèle avec forkJoin
          forkJoin(stockNameRequests).subscribe({
            next: (results) => {
              console.log('Résultats des requêtes de noms de stock:', results);
              this.applyFilters();
              this.loading = false;
            },
            error: (err) => {
              console.error('Erreur lors du chargement des noms de stock:', err);
              this.applyFilters();
              this.loading = false;
            },
            complete: () => {
              console.log('Toutes les requêtes de noms de stock sont terminées');
              this.applyFilters();
              this.loading = false;
            }
          });
        } else {
          this.applyFilters();
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des factures:', err);
        this.errorMessage = 'Impossible de charger les factures. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  // Méthode pour appliquer tous les filtres
  applyFilters(): void {
    // Partir de la liste complète
    let filtered = [...this.bills];
    
    // Filtrer par numéro de facture si une recherche est en cours
    if (this.searchTerm.trim()) {
      const searchTermLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(bill => 
        bill.num_Bill.toLowerCase().includes(searchTermLower)
      );
    }
    
    // Filtrer par méthode de paiement (Status)
    if (this.statusFilter !== 'ALL') {
      filtered = filtered.filter(bill => bill.status === this.statusFilter);
    }
    
    // Filtrer par statut de paiement (PaymentMode)
    if (this.paymentModeFilter !== 'ALL') {
      filtered = filtered.filter(bill => bill.paymentMode === this.paymentModeFilter);
    }
    
    // Mettre à jour la liste filtrée
    this.filteredBills = filtered;
  }

  // Méthode pour obtenir le nom du stock associé à une facture
  getStockName(bill: any): string {
    // Si la facture n'a pas de stock associé
    if (!bill || !bill.stock || !bill.stock.id_stock) {
      return 'Non associé';
    }
    
    // Obtenir l'ID du stock
    const stockId = Number(bill.stock.id_stock);
    console.log(`Récupération du nom du stock pour ID=${stockId}`);
    
    // Vérifier si le stock existe dans notre Map
    if (this.stocksMap.has(stockId)) {
      const stock = this.stocksMap.get(stockId);
      console.log(`Stock trouvé dans la map:`, stock);
      
      // Vérification supplémentaire pour s'assurer que le stock et son nom sont définis
      if (stock && stock.name) {
        return stock.name;
      } else {
        console.log(`Stock trouvé mais son nom est undefined ou null:`, stock);
        this.loadStockInfoForBill(bill);
        return `Stock #${stockId}`;
      }
    } else {
      // Si le stock n'est pas trouvé, essayer de le charger
      console.log(`Stock non trouvé dans la map, chargement des infos pour ID=${stockId}`);
      this.loadStockInfoForBill(bill);
      return `Chargement... (#${stockId})`;
    }
  }

  // Charger les informations de stock pour une facture spécifique
  loadStockInfoForBill(bill: any): void {
    if (!bill?.id_Bill) {
      console.error('Impossible de charger les infos de stock: ID de facture manquant');
      return;
    }
    
    console.log(`Chargement des infos de stock pour la facture ID=${bill.id_Bill}`);
    this.billService.getStockNameForBill(bill.id_Bill).subscribe({
      next: (response) => {
        console.log(`Réponse reçue pour la facture ID=${bill.id_Bill}:`, response);
        if (response && response.stockName && bill.stock && bill.stock.id_stock) {
          const stockId = Number(bill.stock.id_stock);
          
          // Mise à jour de la map des stocks avec le nom du stock
          this.stocksMap.set(stockId, {
            id_stock: stockId,
            name: response.stockName
          });
          
          console.log(`Stock ID=${stockId} mis à jour avec le nom: ${response.stockName}`);
          
          // Forcer une mise à jour de l'affichage en créant une nouvelle référence
          this.filteredBills = [...this.filteredBills];
        } else {
          console.warn(`Pas de nom de stock trouvé dans la réponse pour la facture ID=${bill.id_Bill}`);
        }
      },
      error: (err) => {
        console.error(`Erreur lors du chargement des infos de stock pour facture ID=${bill.id_Bill}:`, err);
      }
    });
  }
  
  // Méthodes utilitaires pour l'affichage
  getPaymentMethodDisplay(status: string): string {
    switch (status) {
      case Status.CASH: return 'Espèces';
      case Status.TRANSFER: return 'Virement';
      case Status.CHECK: return 'Chèque';
      case Status.BANK_CARD: return 'Carte bancaire';
      default: return status;
    }
  }
  
  getPaymentStatusDisplay(paymentMode: string): string {
    switch (paymentMode) {
      case PaymentMode.PAID: return 'Payée';
      case PaymentMode.PENDING: return 'En attente';
      case PaymentMode.CANCELLED: return 'Annulée';
      default: return paymentMode;
    }
  }

  // Méthodes pour effacer les filtres
  clearStatusFilter(): void {
    this.statusFilter = 'ALL';
    this.applyFilters();
  }
  
  clearPaymentModeFilter(): void {
    this.paymentModeFilter = 'ALL';
    this.applyFilters();
  }
  
  clearSearchTerm(): void {
    this.searchTerm = '';
    this.applyFilters();
  }
  
  clearAllFilters(): void {
    this.statusFilter = 'ALL';
    this.paymentModeFilter = 'ALL';
    this.searchTerm = '';
    this.applyFilters();
  }

  createNewBill(): void {
    this.router.navigate(['/admin/bill/create']);
  }

  viewBill(id?: number): void {
    if (id) {
      this.router.navigate(['/admin/bill/view', id]);
    }
  }

  editBill(id?: number): void {
    if (id) {
      this.router.navigate(['/admin/bill/edit', id]);
    }
  }

  deleteBill(id?: number): void {
    if (!id) return;

    if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      this.billService.deleteBill(id).subscribe({
        next: () => {
          this.bills = this.bills.filter(bill => bill.id_Bill !== id);
          this.filteredBills = this.filteredBills.filter(bill => bill.id_Bill !== id);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de la facture:', err);
          this.errorMessage = 'Impossible de supprimer la facture. Veuillez réessayer.';
        }
      });
    }
  }
}
