import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { BillService, Bill, Status, PaymentMode } from '../../../services/bill.service';
import { StockService } from '../../../services/stock.service';
import { PaymentService } from '../../../services/payment.service';
import { environment } from '../../../../environments/environment';

// Déclaration pour Stripe et les modules manquants
declare var Stripe: any;
declare const html2canvas: any;
declare const jsPDF: any;

@Component({
  selector: 'app-bill-view',
  templateUrl: './bill-view.component.html',
  styleUrls: ['./bill-view.component.scss']
})
export class BillViewComponent implements OnInit {
  @ViewChild('printSection') printSection!: ElementRef;
  
  bill: Bill | null = null;
  loading = false;
  errorMessage: string | null = null;
  stockName: string = '';
  generatingPdf = false;
  processingPayment = false;
  
  // Nouvel état pour afficher le message de succès
  paymentSuccessMessage: string | null = null;
  
  // Propriété pour le modal de paiement
  showPaymentModal = false;
  paymentModalData = {
    clientSecret: '',
    paymentIntentId: '',
    billId: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private billService: BillService,
    private stockService: StockService,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    this.loadBill();
    
    // Vérifier s'il y a des paramètres de paiement dans l'URL
    this.checkPaymentStatus();
  }

  loadBill(): void {
    this.loading = true;
    const id = this.route.snapshot.paramMap.get('id');
    
    if (!id) {
      this.errorMessage = "ID de facture non spécifié";
      this.loading = false;
      return;
    }
    
    this.billService.getBillById(+id).subscribe({
      next: (data) => {
        this.bill = data;
        
        // Charger le nom du stock si disponible
        if (this.bill && this.bill.stock && this.bill.stock.id_stock) {
          this.loadStockName(this.bill.id_Bill || 0);
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la facture:', err);
        this.errorMessage = 'Impossible de charger les détails de la facture';
        this.loading = false;
      }
    });
  }

  loadStockName(billId: number): void {
    this.billService.getStockNameForBill(billId).subscribe({
      next: (response) => {
        if (response && response.stockName) {
          this.stockName = response.stockName;
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement du nom du stock:', err);
      }
    });
  }

  getStatusDisplay(status: string): string {
    switch (status) {
      case Status.CASH: return 'Espèces';
      case Status.TRANSFER: return 'Virement';
      case Status.CHECK: return 'Chèque';
      case Status.BANK_CARD: return 'Carte bancaire';
      default: return status;
    }
  }
  
  getPaymentModeDisplay(paymentMode: string): string {
    switch (paymentMode) {
      case PaymentMode.PAID: return 'Payée';
      case PaymentMode.PENDING: return 'En attente';
      case PaymentMode.CANCELLED: return 'Annulée';
      default: return paymentMode;
    }
  }
  
  getPaymentStatusClass(paymentMode: string): string {
    switch (paymentMode) {
      case PaymentMode.PAID: return 'bg-success';
      case PaymentMode.PENDING: return 'bg-warning';
      case PaymentMode.CANCELLED: return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
  
  goBack(): void {
    this.location.back();
  }
  
  editBill(): void {
    if (this.bill && this.bill.id_Bill) {
      this.router.navigate(['/admin/bill/edit', this.bill.id_Bill]);
    }
  }

  // Méthode pour générer et imprimer le PDF
  generatePDF(): void {
    if (!this.bill) {
      this.errorMessage = "Impossible de générer le PDF: données de facture manquantes";
      return;
    }
    
    this.generatingPdf = true;
    
    // Attendre le prochain cycle pour s'assurer que les éléments DOM sont prêts
    setTimeout(() => {
      try {
        // Créer une nouvelle fenêtre pour l'impression
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        
        if (!printWindow) {
          this.errorMessage = "Impossible d'ouvrir la fenêtre d'impression. Veuillez vérifier les paramètres de votre navigateur.";
          this.generatingPdf = false;
          return;
        }
        
        // Créer le contenu HTML du PDF
        const printContent = this.createPrintContent();
        
        // Écrire le contenu dans la nouvelle fenêtre
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Déclencher l'impression après le chargement complet du contenu
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
          
          // Fermer la fenêtre après l'impression (ou après un délai si l'utilisateur annule)
          const checkPrintClosed = setInterval(() => {
            if (printWindow.closed) {
              clearInterval(checkPrintClosed);
              this.generatingPdf = false;
            }
          }, 1000);
          
          // Fermer la fenêtre après 60 secondes maximum
          setTimeout(() => {
            if (!printWindow.closed) {
              printWindow.close();
              clearInterval(checkPrintClosed);
              this.generatingPdf = false;
            }
          }, 60000);
        };
      } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        this.errorMessage = 'Une erreur est survenue lors de la génération du PDF.';
        this.generatingPdf = false;
      }
    }, 100);
  }
  
  // Créer le contenu HTML pour l'impression
  private createPrintContent(): string {
    if (!this.bill) return '';
    
    // Formater la date
    const dateObj = new Date(this.bill.date);
    const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;
    
    // CSS pour la mise en page de l'impression
    const styles = `
      <style>
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.5;
            color: #333;
          }
          .invoice-container {
            padding: 20px;
          }
          .invoice-header {
            text-align: center;
            margin-bottom: 30px;
          }
          .invoice-header h1 {
            font-size: 24px;
            color: #333;
            margin-bottom: 5px;
          }
          .company-info {
            margin-bottom: 30px;
            float: left;
            width: 50%;
          }
          .invoice-info {
            margin-bottom: 30px;
            float: right;
            width: 40%;
            text-align: right;
          }
          .clearfix:after {
            content: "";
            display: table;
            clear: both;
          }
          .invoice-line {
            border-top: 1px solid #ddd;
            margin: 20px 0;
          }
          .stock-info {
            margin-bottom: 20px;
          }
          .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .invoice-table th {
            background-color: #f2f2f2;
            text-align: left;
            padding: 8px;
            border-bottom: 2px solid #ddd;
          }
          .invoice-table td {
            padding: 8px;
            border-bottom: 1px solid #ddd;
          }
          .total-row {
            font-weight: bold;
          }
          .invoice-footer {
            margin-top: 40px;
            font-size: 12px;
            color: #666;
          }
          .terms {
            margin-top: 30px;
          }
          .terms h3 {
            font-size: 16px;
            margin-bottom: 10px;
          }
          .footer-note {
            margin-top: 40px;
            font-style: italic;
            text-align: center;
            font-size: 11px;
            color: #999;
          }
        }
      </style>
    `;
    
    // Contenu HTML de la facture
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Facture #${this.bill.num_Bill}</title>
        ${styles}
      </head>
      <body>
        <div class="invoice-container">
          <div class="invoice-header">
            <h1>FACTURE</h1>
          </div>
          
          <div class="clearfix">
            <div class="company-info">
              <h3>Builderz Company</h3>
              <p>123 Rue de Construction<br>
              75000 Paris, France<br>
              Tél: +33 1 23 45 67 89<br>
              Email: contact@builderz.com</p>
            </div>
            
            <div class="invoice-info">
              <p><strong>Facture #:</strong> ${this.bill.num_Bill}</p>
              <p><strong>Date:</strong> ${formattedDate}</p>
              <p><strong>Statut:</strong> ${this.getPaymentModeDisplay(this.bill.paymentMode)}</p>
              <p><strong>Méthode:</strong> ${this.getStatusDisplay(this.bill.status)}</p>
            </div>
          </div>
          
          <div class="invoice-line"></div>
          
          ${this.bill.stock && this.bill.stock.id_stock ? `
          <div class="stock-info">
            <h3>Stock associé:</h3>
            <p>ID: ${this.bill.stock.id_stock}</p>
            ${this.stockName ? `<p>Nom: ${this.stockName}</p>` : ''}
          </div>
          ` : `
          <div class="stock-info">
            <p>Aucun stock associé</p>
          </div>
          `}
          
          <table class="invoice-table">
            <thead>
              <tr>
                <th style="width: 70%">Description</th>
                <th style="width: 30%; text-align: right">Montant</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Montant total</td>
                <td style="text-align: right">${this.bill.total_Amount.toFixed(2)} €</td>
              </tr>
              <tr class="total-row">
                <td style="text-align: right">Total:</td>
                <td style="text-align: right">${this.bill.total_Amount.toFixed(2)} €</td>
              </tr>
            </tbody>
          </table>
          
          <div class="terms">
            <h3>Conditions de paiement:</h3>
            <p>Le paiement est dû dans les 30 jours suivant la date de facturation.<br>
            Veuillez inclure le numéro de facture dans votre paiement.</p>
            
            <p>Merci pour votre confiance.</p>
          </div>
          
          <div class="footer-note">
            <p>Facture générée automatiquement par Builderz System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Initie le processus de paiement pour la facture courante
   */
  payBill(): void {
    if (!this.bill) {
      this.errorMessage = "Impossible de traiter le paiement: facture non disponible";
      return;
    }
  
    if (!this.bill.id_Bill) {
      this.errorMessage = "Impossible de traiter le paiement: identifiant de facture manquant";
      return;
    }
    
    // Vérifie si la facture est déjà payée
    if (this.bill.paymentMode === PaymentMode.PAID) {
      this.errorMessage = "Cette facture a déjà été payée";
      return;
    }
    
    this.processingPayment = true;
    
    // Récupérer l'ID de la facture de manière sécurisée
    const billId = this.bill.id_Bill;
    
    // Appel au service pour créer une session Stripe Checkout
    this.paymentService.createPaymentIntent(billId).subscribe({
      next: (response) => {
        console.log('PaymentIntent créé avec succès:', response);
        
        // Stocker l'ID du PaymentIntent dans le localStorage pour le récupérer au retour
        localStorage.setItem('payment_intent_id', response.paymentIntentId);
        localStorage.setItem('bill_id_for_payment', String(billId));
        
        // Au lieu de rediriger, ouvrir le formulaire de paiement dans un modal sur la même page
        this.openPaymentModal(response.clientSecret, response.paymentIntentId, billId);
      },
      error: (err) => {
        console.error('Erreur lors de la création du PaymentIntent:', err);
        this.errorMessage = `Impossible de créer la session de paiement: ${err.error?.error || err.message || 'Erreur inconnue'}`;
        this.processingPayment = false;
      }
    });
  }

  // Nouvelle méthode pour ouvrir le formulaire de paiement dans un modal
  private openPaymentModal(clientSecret: string, paymentIntentId: string, billId: number): void {
    this.paymentModalData = {
      clientSecret,
      paymentIntentId,
      billId
    };
    
    this.showPaymentModal = true;
    
    // Initialiser le formulaire de paiement Stripe
    setTimeout(() => {
      this.initializeStripePayment();
    }, 100);
  }

  // Nouvelle méthode pour initialiser Stripe
  private initializeStripePayment(): void {
    // Charger le script Stripe s'il n'est pas déjà chargé
    if (typeof Stripe === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => this.setupStripeElements();
      document.head.appendChild(script);
    } else {
      this.setupStripeElements();
    }
  }

  // Configuration des éléments Stripe
  private setupStripeElements(): void {
    try {
      const stripe = Stripe(environment.stripePublicKey);
      
      const elements = stripe.elements({
        clientSecret: this.paymentModalData.clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#fdbe33',
            fontFamily: 'Arial, sans-serif',
          },
        },
        locale: 'fr'
      });
      
      const paymentElement = elements.create('payment');
      const paymentContainer = document.getElementById('payment-element-container');
      
      if (paymentContainer) {
        paymentElement.mount('#payment-element-container');
        
        // Configurer le bouton de paiement
        const submitButton = document.getElementById('submit-payment');
        if (submitButton) {
          submitButton.addEventListener('click', async () => {
            if (submitButton instanceof HTMLButtonElement) {
              submitButton.disabled = true;
              submitButton.textContent = 'Traitement en cours...';
            }
            
            const { error, paymentIntent } = await stripe.confirmPayment({
              elements,
              confirmParams: {
                return_url: window.location.href,
              },
              redirect: 'if_required'
            });
            
            if (error) {
              // Afficher l'erreur
              const messageElement = document.getElementById('payment-message');
              if (messageElement) {
                messageElement.textContent = error.message || 'Une erreur est survenue';
                messageElement.style.display = 'block';
              }
              if (submitButton instanceof HTMLButtonElement) {
                submitButton.disabled = false;
                submitButton.textContent = 'Payer maintenant';
              }
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
              // Paiement réussi sans redirection - gérer directement
              this.handleSuccessfulPayment(this.paymentModalData.paymentIntentId, this.paymentModalData.billId);
            }
          });
        }
      } else {
        console.error('Conteneur de paiement non trouvé');
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de Stripe:', error);
      this.errorMessage = 'Erreur lors de l\'initialisation du paiement';
      this.closePaymentModal();
    }
  }

  // Fermer le modal de paiement
  closePaymentModal(): void {
    this.showPaymentModal = false;
    this.processingPayment = false;
  }

  // Gérer un paiement réussi
  private handleSuccessfulPayment(paymentIntentId: string, billId: number): void {
    // Confirmer le paiement côté serveur
    this.paymentService.confirmPayment(billId, paymentIntentId).subscribe({
      next: (response) => {
        // Mettre à jour la facture en mémoire
        if (response && response.bill) {
          this.bill = response.bill as Bill;
        }
        
        // Fermer le modal
        this.closePaymentModal();
        
        // Afficher le message de succès
        this.showPaymentSuccessMessage('Paiement effectué avec succès! Votre facture a été mise à jour.');
        
        // Rafraîchir les données de la facture
        this.loadBill();
      },
      error: (err) => {
        console.error('Erreur lors de la confirmation du paiement:', err);
        this.errorMessage = 'Le paiement semble avoir réussi mais une erreur est survenue lors de la mise à jour de la facture.';
        this.closePaymentModal();
      }
    });
  }

  // Afficher un message de succès dans l'interface
  private showPaymentSuccessMessage(message: string): void {
    // Définir le message de succès à afficher dans le template
    this.paymentSuccessMessage = message;
    
    // Effacer tout message d'erreur
    this.errorMessage = null;
    
    // Créer également une notification visuelle flottante
    this.createFloatingNotification(message);
    
    // Masquer automatiquement le message après 10 secondes
    setTimeout(() => {
      this.paymentSuccessMessage = null;
    }, 10000);
  }

  // Créer une notification flottante
  private createFloatingNotification(message: string): void {
    const notification = document.createElement('div');
    notification.className = 'payment-notification';
    
    notification.innerHTML = `
      <div class="notification-icon"><i class="pe-7s-check-circle"></i></div>
      <div class="notification-content">
        <div class="notification-title">Paiement réussi</div>
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Ajouter un gestionnaire pour fermer la notification
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        notification.classList.add('closing');
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      });
    }
    
    // Faire apparaître la notification avec animation
    setTimeout(() => {
      notification.classList.add('visible');
    }, 10);
    
    // Supprimer automatiquement après 5 secondes
    setTimeout(() => {
      notification.classList.add('closing');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 5000);
  }

  /**
   * Vérifie si un paiement vient d'être effectué (paramètres d'URL)
   */
  checkPaymentStatus(): void {
    const paymentIntentId = this.route.snapshot.queryParamMap.get('payment_intent');
    const redirectStatus = this.route.snapshot.queryParamMap.get('redirect_status');
    
    if (paymentIntentId && redirectStatus) {
      const billIdStr = localStorage.getItem('bill_id_for_payment');
      const billId = billIdStr ? parseInt(billIdStr) : null;
      
      // Nettoyer l'URL (supprimer les paramètres)
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        replaceUrl: true
      });
      
      if (billId) {
        if (redirectStatus === 'succeeded') {
          // Le paiement a réussi après une redirection (3D Secure par exemple)
          this.handleSuccessfulPayment(paymentIntentId, billId);
        } else {
          this.errorMessage = 'Le paiement a été annulé ou a échoué.';
        }
        
        // Nettoyage du localStorage
        localStorage.removeItem('payment_intent_id');
        localStorage.removeItem('bill_id_for_payment');
      }
    }
  }
}
