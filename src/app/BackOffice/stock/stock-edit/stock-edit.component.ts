import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StockService } from '../../../services/stock.service';
import { NotificationService } from '../../../services/notification.service';
import { Stock, StockCategory } from '../stock.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-stock-edit',
  templateUrl: './stock-edit.component.html',
  styleUrls: ['./stock-edit.component.css']
})
export class StockEditComponent implements OnInit {
  stock: Stock | null = null;
  categories: StockCategory[] = ['MATERIALS', 'TOOLS', 'ELECTRICAL_PLUMBING'];
  formErrors = {
    name: '',
    quantity: '',
    unitPrice: '',
    description: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stockService: StockService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadStock(Number(id));
    }
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
  loadStock(id: number): void {
    this.stockService.getStockById(id).subscribe({
      next: (data) => {
        this.stock = {
          ...data,
          bills: data.bills || []
        };
      },
      error: (error) => {
        this.notificationService.showError('Erreur lors du chargement du stock');
        console.error(error);
      }
    });
  }
  
  updateStock(): void {
    if (!this.stock) return;

    const isNameValid = this.validateName(this.stock.name);
    const isQuantityValid = this.validateQuantity(this.stock.quantity);
    const isPriceValid = this.validateUnitPrice(this.stock.unitPrice);
    const isDescriptionValid = this.validateDescription(this.stock.description);

    if (!isNameValid || !isQuantityValid || !isPriceValid || !isDescriptionValid) {
      this.notificationService.showError('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    this.stockService.updateStock(this.stock.id_stock, this.stock).subscribe({
      next: () => {
        this.notificationService.showSuccess('Stock mis à jour avec succès');
        this.router.navigate(['/admin/stock']);
      },
      error: (error) => {
        this.notificationService.showError('Erreur lors de la mise à jour');
        console.error(error);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/stock']);
  }
} 