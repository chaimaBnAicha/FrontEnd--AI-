import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BillService, Bill, Status, PaymentMode, StockReference } from '../../../services/bill.service';
import { StockService } from '../../../services/stock.service';

@Component({
  selector: 'app-bill-form',
  templateUrl: './bill-form.component.html',
  styleUrls: ['./bill-form.component.scss']
})
export class BillFormComponent implements OnInit {
  billForm!: FormGroup;
  isEditMode = false;
  billId!: number;
  loading = false;
  submitted = false;
  stocks: any[] = [];
  errorMessage: string | null = null;
  
  // Enums pour le template - updated to use the correct enum names
  statuses = Object.values(Status);
  paymentModes = Object.values(PaymentMode);

  constructor(
    private formBuilder: FormBuilder,
    private billService: BillService,
    private stockService: StockService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('Statuses:', this.statuses);
    console.log('Payment modes:', this.paymentModes);
    this.initForm();
    this.loadStocks();
    
    // Vérifier si nous sommes en mode édition
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.billId = +params['id'];
        this.loadBill(this.billId);
      }
    });
  }

  initForm(): void {
    this.billForm = this.formBuilder.group({
      num_Bill: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9\-_\s]+$/)]],
      date: ['', [Validators.required]], // Enlevé dateValidator, nous le gérerons différemment
      total_Amount: [0, [Validators.required, Validators.min(0.01)]],
      status: [Status.CASH, [Validators.required]],
      paymentMode: [PaymentMode.PAID, [Validators.required]],
      stock: this.formBuilder.group({
        id_stock: [null]
      })
    });
  }

  // Date validator amélioré - maintenant fonction libre au lieu d'être validator
  validateDate(dateValue: string): { isValid: boolean, message?: string } {
    if (!dateValue) {
      return { isValid: false, message: 'La date est requise' };
    }
    
    try {
      const selectedDate = new Date(dateValue);
      
      // Vérifier si la date est valide
      if (isNaN(selectedDate.getTime())) {
        return { isValid: false, message: 'Format de date invalide' };
      }
      
      // Obtenir l'année courante
      const currentYear = new Date().getFullYear();
      
      // Vérifier si l'année est raisonnable (dans un intervalle de ±5 ans de l'année courante)
      const selectedYear = selectedDate.getFullYear();
      if (selectedYear < currentYear - 5 || selectedYear > currentYear + 5) {
        return { 
          isValid: false, 
          message: `L'année doit être comprise entre ${currentYear - 5} et ${currentYear + 5}` 
        };
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, message: 'Erreur de traitement de date' };
    }
  }

  loadStocks(): void {
    this.stockService.getAllStocks().subscribe({
      next: (data) => {
        this.stocks = data;
        console.log('Stocks loaded:', this.stocks);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des stocks:', err);
        this.errorMessage = 'Erreur lors du chargement des stocks';
      }
    });
  }

  loadBill(id: number): void {
    this.loading = true;
    this.billService.getBillById(id).subscribe({
      next: (bill) => {
        // Formater la date en YYYY-MM-DD pour le champ input
        const formattedDate = bill.date ? new Date(bill.date).toISOString().split('T')[0] : '';
        
        this.billForm.patchValue({
          num_Bill: bill.num_Bill,
          date: formattedDate,
          total_Amount: bill.total_Amount,
          status: bill.status,
          paymentMode: bill.paymentMode,
          stock: {
            id_stock: bill.stock?.id_stock || null
          }
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la facture:', err);
        this.errorMessage = 'Impossible de charger la facture. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    console.log('Form submitted, values:', this.billForm.value);
    console.log('Form valid?', this.billForm.valid);
    
    if (this.billForm.invalid) {
      this.validateAllFormFields();
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires correctement.';
      return;
    }
    
    // Vérification supplémentaire du format de numéro de facture
    const numBill = this.billForm.get('num_Bill')?.value;
    if (!/^[a-zA-Z0-9\-_\s]{3,20}$/.test(numBill)) {
      this.errorMessage = 'Le numéro de facture doit contenir entre 3 et 20 caractères alphanumériques.';
      return;
    }

    // Validation de date améliorée
    const dateValue = this.billForm.get('date')?.value;
    const dateValidation = this.validateDate(dateValue);
    if (!dateValidation.isValid) {
      this.errorMessage = dateValidation.message || 'Date invalide';
      return;
    }
    
    // Formater la date correctement
    const formattedDate = this.formatDate(dateValue);
    
    // Validation du montant
    const amount = Number(this.billForm.get('total_Amount')?.value);
    if (isNaN(amount) || amount <= 0) {
      this.errorMessage = 'Le montant doit être un nombre positif.';
      return;
    }
    
    this.loading = true;
    
    // Ensure we're using the enum values correctly
    const formValue = this.billForm.value;
    
    const billData: Bill = {
      num_Bill: formValue.num_Bill,
      date: formattedDate,
      total_Amount: Number(formValue.total_Amount),
      status: formValue.status,
      paymentMode: formValue.paymentMode,
      stock: formValue.stock?.id_stock ? { id_stock: Number(formValue.stock.id_stock) } : undefined
    };
    
    // Si nous sommes en mode édition, ajouter l'ID de la facture
    if (this.isEditMode) {
      billData.id_Bill = this.billId;
    }
    
    console.log('Final bill data being sent:', billData);
    
    if (this.isEditMode) {
      this.billService.updateBill(this.billId, billData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/admin/bill']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Erreur lors de la mise à jour de la facture:', err);
          this.errorMessage = err.message || 'Impossible de mettre à jour la facture. Veuillez vérifier vos données et réessayer.';
        }
      });
    } else {
      this.billService.createBill(billData).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/admin/bill']);
        },
        error: (err) => {
          this.loading = false;
          console.error('Erreur lors de la création de la facture:', err);
          this.errorMessage = err.message || 'Impossible de créer la facture. Veuillez vérifier vos données et réessayer.';
        }
      });
    }
  }

  // Méthode pour formater la date au format YYYY-MM-DD
  private formatDate(date: string): string {
    if (!date) return '';
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return date;
      }
      
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return date;
    }
  }

  // Parcourt et valide chaque champ du formulaire pour afficher les erreurs
  private validateAllFormFields(): void {
    Object.keys(this.billForm.controls).forEach(field => {
      const control = this.billForm.get(field);
      if (control) {
        if (control instanceof FormGroup) {
          Object.keys(control.controls).forEach(nestedField => {
            const nestedControl = control.get(nestedField);
            if (nestedControl) {
              nestedControl.markAsTouched({ onlySelf: true });
            }
          });
        } else {
          control.markAsTouched({ onlySelf: true });
          console.log(`Field ${field} is ${control.valid ? 'valid' : 'invalid'}:`, control.errors);
        }
      }
    });
  }

  // Méthodes auxiliaires pour la validation
  hasError(controlName: string, errorName?: string): boolean {
    const control = this.billForm.get(controlName);
    if (!control) return false;
    if (!errorName) return control.invalid && (control.dirty || control.touched || this.submitted);
    return control.hasError(errorName) && (control.dirty || control.touched || this.submitted);
  }

  // Pour accéder aux contrôles du formulaire dans le template
  get formControls() { 
    return this.billForm.controls; 
  }
}
