import { Component, OnInit, OnDestroy } from '@angular/core';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';
import { StockService, Stock as ServiceStock, NewStock } from '../../services/stock.service';
import { Stock as StockModel, StockCategory } from './stock.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit, OnDestroy {
  stocks: StockModel[] = [];
  newStock: Partial<StockModel> = {
    name: '',
    quantity: 0,
    unitPrice: 0,
    description: '',
    category: 'MATERIALS' as StockCategory
  };
  editingStock: StockModel | null = null;
  filteredStocks: StockModel[] = [];
  selectedCategory: StockCategory | 'ALL' = 'ALL';
  categories: StockCategory[] = ['MATERIALS', 'TOOLS', 'ELECTRICAL_PLUMBING'];
  formErrors = {
    name: '',
    quantity: '',
    unitPrice: '',
    description: ''
  };
  searchTerm: string = '';
  
  stockStats = {
    totalItems: 0,
    totalValue: 0,
    averagePrice: 0,
    lowStockItems: 0,
    categoryCounts: {
      MATERIALS: 0,
      TOOLS: 0,
      ELECTRICAL_PLUMBING: 0
    }
  };

  // Add these new properties
  notifications: Notification[] = [];
  private notificationSubscription!: Subscription;
  unreadCount = 0;
  showNotificationsList = false;

  constructor(
    private stockService: StockService,
    public notificationService: NotificationService,
        private authService: AuthService,
    
    private modalService: NgbModal
  ) { }

  ngOnInit(): void {
    this.loadStocks();
    
    // Add notification subscription
    this.notificationSubscription = this.notificationService.notifications$.subscribe(notification => {
      this.notifications.unshift(notification);
      this.unreadCount++;
    });
  }

  // Add these new methods
  toggleNotifications(): void {
    this.showNotificationsList = !this.showNotificationsList;
    if (this.showNotificationsList) {
      this.unreadCount = 0;
    }
  }

  clearNotifications(): void {
    this.notifications = [];
    this.unreadCount = 0;
  }

  // Add ngOnDestroy method
  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  loadStocks(): void {
    this.stockService.getAllStocks().subscribe({
      next: (data) => {
        this.stocks = data.map(stock => this.convertServiceStockToModel(stock));
        this.filterStocks();
        this.stocks.forEach(stock => {
          this.notificationService.checkLowStock(stock);
        });
        this.notificationService.showSuccess('Stocks chargés avec succès');
      },
      error: (error) => {
        console.error('Erreur lors du chargement des stocks:', error);
        this.notificationService.showError('Erreur lors du chargement des stocks');
      }
    });
  }
  

  filterStocks(): void {
    let filtered = [...this.stocks];
    
    // Filtre par catégorie
    if (this.selectedCategory !== 'ALL') {
      filtered = filtered.filter(stock => stock.category === this.selectedCategory);
    }
    
    // Filtre par nom
    if (this.searchTerm.trim()) {
      const searchTermLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(stock => 
        stock.name.toLowerCase().includes(searchTermLower)
      );
    }
    
    this.filteredStocks = filtered;
  }

  onCategoryChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedCategory = select.value as StockCategory | 'ALL';
    this.filterStocks();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.filterStocks();
  }

  private convertServiceStockToModel(serviceStock: ServiceStock): StockModel {
    return {
      id_stock: serviceStock.id_stock,
      name: serviceStock.name,
      quantity: serviceStock.quantity,
      unitPrice: serviceStock.unitPrice,
      description: serviceStock.description || '',
      category: serviceStock.category as StockCategory,
      bills: serviceStock.bills || []
    };
  }

  private convertModelToServiceStock(modelStock: StockModel): ServiceStock {
    return {
      id_stock: modelStock.id_stock,
      name: modelStock.name,
      quantity: modelStock.quantity,
      unitPrice: modelStock.unitPrice,
      description: modelStock.description,
      category: modelStock.category,
      bills: modelStock.bills || []
    };
  }

  validateStock(stock: Partial<StockModel>): boolean {
    if (!stock.name || stock.name.trim().length < 2) {
      this.notificationService.showError('Le nom doit contenir au moins 2 caractères');
      return false;
    }
    if (typeof stock.quantity !== 'number' || stock.quantity < 0) {
      this.notificationService.showError('La quantité ne peut pas être négative');
      return false;
    }
    if (typeof stock.unitPrice !== 'number' || stock.unitPrice < 0) {
      this.notificationService.showError('Le prix ne peut pas être négatif');
      return false;
    }
    return true;
  }

  validateName(name: string): boolean {
    if (!name || name.trim().length === 0) {
      this.formErrors.name = 'Le nom est requis';
      return false;
    }
    if (name.trim().length < 3) {
      this.formErrors.name = 'Le nom doit contenir au moins 3 caractères';
      return false;
    }
    this.formErrors.name = '';
    return true;
  }

  validateQuantity(quantity: number): boolean {
    if (quantity === null || quantity === undefined) {
      this.formErrors.quantity = 'La quantité est requise';
      return false;
    }
    if (quantity < 0) {
      this.formErrors.quantity = 'La quantité ne peut pas être négative';
      return false;
    }
    this.formErrors.quantity = '';
    return true;
  }

  validateUnitPrice(price: number): boolean {
    if (price === null || price === undefined) {
      this.formErrors.unitPrice = 'Le prix est requis';
      return false;
    }
    if (price <= 0) {
      this.formErrors.unitPrice = 'Le prix doit être supérieur à 0';
      return false;
    }
    this.formErrors.unitPrice = '';
    return true;
  }

  validateDescription(description: string): boolean {
    if (!description || description.trim().length === 0) {
      this.formErrors.description = 'La description est requise';
      return false;
    }
    if (description.trim().length < 10) {
      this.formErrors.description = 'La description doit contenir au moins 10 caractères';
      return false;
    }
    this.formErrors.description = '';
    return true;
  }

  addStock(): void {
    const token = this.authService.getToken();
  
    if (!token) {
      console.error('No authentication token available.');
      return;
    }
  
    const isNameValid = this.validateName(this.newStock.name || '');
    const isQuantityValid = this.validateQuantity(this.newStock.quantity || 0);
    const isPriceValid = this.validateUnitPrice(this.newStock.unitPrice || 0);
    const isDescriptionValid = this.validateDescription(this.newStock.description || '');
  
    if (!isNameValid || !isQuantityValid || !isPriceValid || !isDescriptionValid) {
      this.notificationService.showError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }
  
    const stockToAdd: NewStock = {
      name: this.newStock.name || '',
      description: this.newStock.description || '',
      quantity: this.newStock.quantity || 0,
      unitPrice: this.newStock.unitPrice || 0,
      category: (this.newStock.category || 'MATERIALS') as StockCategory,
      bills: []
    };
  
    this.stockService.addStock(stockToAdd, token).subscribe({
      next: (stock) => {
        this.stocks.push(this.convertServiceStockToModel(stock as ServiceStock));
        this.resetNewStock();
        this.notificationService.showSuccess('Stock ajouté avec succès');
      },
      error: (error) => {
        console.error('Erreur complète:', error);
        this.notificationService.showError(this.getErrorMessage(error));
      }
    });
  }
  
  
  private resetNewStock(): void {
    this.newStock = {
      name: '',
      description: '',
      quantity: 0,
      unitPrice: 0,
      category: 'MATERIALS' as StockCategory
    };
  }

  editStock(stock: StockModel): void {
    this.editingStock = {
      id_stock: stock.id_stock,
      name: stock.name,
      description: stock.description,
      quantity: stock.quantity,
      unitPrice: stock.unitPrice,
      category: stock.category,
      bills: stock.bills
    };
  }

  updateStock(): void {
    if (!this.editingStock || typeof this.editingStock.id_stock === 'undefined') {
      this.notificationService.showError('ID du stock non valide');
      return;
    }

    if (!this.validateStock(this.editingStock)) {
      return;
    }

    const stockToUpdate = this.convertModelToServiceStock(this.editingStock);
    
    this.stockService.updateStock(stockToUpdate.id_stock, stockToUpdate).subscribe({
      next: (updatedStock) => {
        const index = this.stocks.findIndex(s => s.id_stock === updatedStock.id_stock);
        if (index !== -1) {
          this.stocks[index] = this.convertServiceStockToModel(updatedStock);
          this.notificationService.checkLowStock(this.stocks[index]);
        }
        this.editingStock = null;
        this.notificationService.showSuccess('Stock mis à jour avec succès');
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du stock:', error);
        this.notificationService.showError(this.getErrorMessage(error));
      }
    });
  }

  deleteStock(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      this.stockService.deleteStock(id).subscribe({
        next: () => {
          this.stocks = this.stocks.filter(stock => stock.id_stock !== id);
          this.notificationService.showSuccess('Stock supprimé avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du stock:', error);
          this.notificationService.showError('Erreur lors de la suppression');
        }
      });
    }
  }
  

  cancelEdit(): void {
    this.editingStock = null;
  }

  private getErrorMessage(error: any): string {
    if (error.error && typeof error.error === 'object') {
      const errorMessages = Object.values(error.error);
      return Array.isArray(errorMessages) ? errorMessages.join(', ') : 'Erreur inconnue';
    }
    if (error.status === 0) {
      return 'Impossible de contacter le serveur. Vérifiez votre connexion.';
    }
    if (error.status === 404) {
      return 'Stock non trouvé.';
    }
    if (error.status === 400) {
      return 'Données invalides. Vérifiez vos entrées.';
    }
    return error.message || 'Une erreur est survenue';
  }

  calculateStats(): void {
    this.stockStats.totalItems = this.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
    this.stockStats.totalValue = this.stocks.reduce((sum, stock) => sum + (stock.quantity * stock.unitPrice), 0);
    this.stockStats.averagePrice = this.stocks.reduce((sum, stock) => sum + stock.unitPrice, 0) / this.stocks.length;
    this.stockStats.lowStockItems = this.stocks.filter(stock => stock.quantity < 10).length;
    
    // Reset category counts
    this.stockStats.categoryCounts = {
      MATERIALS: 0,
      TOOLS: 0,
      ELECTRICAL_PLUMBING: 0
    };
    
    // Count items by category
    this.stocks.forEach(stock => {
      this.stockStats.categoryCounts[stock.category]++;
    });
  }

  openStatsModal(content: any): void {
    this.calculateStats();
    this.modalService.open(content, { size: 'lg' });
  }
}
