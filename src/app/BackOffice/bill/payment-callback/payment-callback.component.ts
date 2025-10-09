import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PaymentService } from '../../../services/payment.service';
import { BillService } from '../../../services/bill.service';
import { environment } from '../../../../environments/environment';

declare var Stripe: any;

@Component({
  selector: 'app-payment-callback',
  templateUrl: './payment-callback.component.html',
  styleUrls: ['./payment-callback.component.scss']
})
export class PaymentCallbackComponent implements OnInit, AfterViewInit {
  clientSecret: string | null = null;
  paymentIntentId: string | null = null;
  billId: number | null = null;
  
  status: 'loading' | 'processing' | 'success' | 'error' = 'loading';
  message: string = '';
  
  stripe: any = null;
  elements: any = null;
  paymentElement: any = null;
  stripePublicKey: string = environment.stripePublicKey; // Utiliser directement la clé de environment
  
  // Pour le débogage
  domReady: boolean = false;
  stripeLoaded: boolean = false;
  containerFound: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private billService: BillService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log("PaymentCallbackComponent initialized");
    this.loadScriptAndInit();
    
    // Récupérer les paramètres de l'URL
    this.route.queryParamMap.subscribe(params => {
      this.clientSecret = params.get('client_secret');
      this.paymentIntentId = params.get('payment_intent_id');
      const billIdParam = params.get('bill_id');
      this.billId = billIdParam ? parseInt(billIdParam) : null;
      
      console.log("URL parameters received:", { 
        clientSecret: this.clientSecret ? '***' : null, 
        paymentIntentId: this.paymentIntentId,
        billId: this.billId
      });
      
      // Vérifier si nous avons un statut de redirection (paiement terminé)
      const redirectStatus = params.get('redirect_status');
      if (redirectStatus) {
        this.handleRedirectCompletion(redirectStatus);
        return;
      }
      
      if (!this.clientSecret || !this.paymentIntentId || !this.billId) {
        this.status = 'error';
        this.message = 'Paramètres invalides. Impossible de procéder au paiement.';
        console.error('Paramètres manquants:', { 
          clientSecret: this.clientSecret ? 'Présent' : 'Manquant', 
          paymentIntentId: this.paymentIntentId ? 'Présent' : 'Manquant',
          billId: this.billId ? 'Présent' : 'Manquant'
        });
        return;
      }
    });
  }

  ngAfterViewInit(): void {
    this.domReady = true;
    console.log("DOM is now ready");
    
    // Si Stripe est déjà chargé, tenter d'initialiser les éléments
    if (this.stripeLoaded && this.clientSecret) {
      this.initializeStripeElements();
    }
  }

  private loadScriptAndInit(): void {
    // Vérifier si Stripe est déjà chargé
    if (typeof Stripe !== 'undefined') {
      console.log("Stripe is already loaded");
      this.stripeLoaded = true;
      return;
    }

    console.log("Loading Stripe.js dynamically");
    // Charger le script Stripe.js
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.async = true;
    script.onload = () => {
      console.log("Stripe.js loaded successfully");
      this.stripeLoaded = true;
      
      // Si les autres conditions sont remplies, initialiser les éléments
      if (this.domReady && this.clientSecret) {
        this.initializeStripeElements();
      }
    };
    script.onerror = (error) => {
      console.error("Failed to load Stripe.js:", error);
      this.status = 'error';
      this.message = "Impossible de charger la bibliothèque de paiement. Veuillez vérifier votre connexion internet.";
    };
    document.head.appendChild(script);
  }

  private handleRedirectCompletion(redirectStatus: string): void {
    console.log('Paiement redirect status:', redirectStatus);
    
    if (redirectStatus === 'succeeded') {
      this.status = 'success';
      this.message = 'Paiement réussi! Mise à jour de la facture...';
      
      // Confirmer le paiement côté serveur
      if (this.billId && this.paymentIntentId) {
        this.confirmPaymentOnServer();
      }
    } else {
      this.status = 'error';
      this.message = 'Le paiement a échoué ou a été annulé.';
    }
  }

  private confirmPaymentOnServer(): void {
    if (!this.billId || !this.paymentIntentId) return;
    
    this.paymentService.confirmPayment(this.billId, this.paymentIntentId).subscribe({
      next: (response) => {
        console.log('Confirmation serveur réussie:', response);
        this.message = 'Paiement confirmé avec succès!';
      },
      error: (err) => {
        console.error('Erreur lors de la confirmation du paiement sur le serveur:', err);
        this.message = 'Le paiement a été effectué mais une erreur est survenue lors de la mise à jour de la facture.';
      }
    });
  }

  private initializeStripeElements(): void {
    if (!this.stripePublicKey) {
      console.error("Stripe public key is missing");
      this.status = 'error';
      this.message = 'Configuration de paiement incomplète (clé manquante).';
      return;
    }

    try {
      console.log("Initializing Stripe with public key:", this.stripePublicKey.substring(0, 8) + '...');
      
      // Initialiser Stripe avec la clé publique
      this.stripe = Stripe(this.stripePublicKey);
      
      if (!this.clientSecret) {
        throw new Error('Client secret is missing');
      }
      
      // S'assurer que le DOM est prêt avant de continuer
      setTimeout(() => {
        this.mountStripeElements();
      }, 300);
    } catch (error) {
      console.error("Error initializing Stripe:", error);
      this.status = 'error';
      this.message = 'Erreur d\'initialisation: ' + (error instanceof Error ? error.message : 'Erreur inconnue');
    }
  }
  
  private mountStripeElements(): void {
    try {
      console.log("Creating Stripe Elements...");
      
      // Créer les éléments de paiement
      this.elements = this.stripe.elements({
        clientSecret: this.clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#fdbe33',
            fontFamily: 'Arial, sans-serif',
          },
        },
        locale: 'fr'
      });
      
      // Rechercher l'élément DOM
      const paymentElementContainer = document.getElementById('payment-element');
      
      if (!paymentElementContainer) {
        console.error("Payment element container not found in the DOM");
        this.containerFound = false;
        
        // Au lieu d'échouer immédiatement, attendre un peu et réessayer jusqu'à 5 fois
        this.retryMounting(0, 5);
        return;
      }
      
      this.containerFound = true;
      console.log("Payment element container found, mounting...");
      
      // Créer et monter l'élément de paiement
      this.paymentElement = this.elements.create('payment');
      this.paymentElement.mount('#payment-element');
      
      // Écouter les événements
      this.paymentElement.on('ready', () => {
        console.log("Payment element is ready");
        this.status = 'processing';
        this.cdr.detectChanges(); // Forcer la mise à jour de la vue
      });
      
      this.paymentElement.on('change', (event: any) => {
        if (event.error) {
          this.message = event.error.message;
          console.error('Payment element error:', event.error);
        } else {
          this.message = '';
        }
        this.cdr.detectChanges();
      });
      
      // Changer le statut pour afficher le formulaire
      this.status = 'processing';
      this.cdr.detectChanges();
    } catch (error) {
      console.error("Error mounting Stripe Elements:", error);
      this.status = 'error';
      this.message = 'Erreur technique: Impossible d\'initialiser le formulaire de paiement.';
      this.cdr.detectChanges();
    }
  }
  
  private retryMounting(attempt: number, maxAttempts: number): void {
    if (attempt >= maxAttempts) {
      console.error(`Failed to find payment element container after ${maxAttempts} attempts`);
      this.status = 'error';
      this.message = 'Erreur technique: conteneur de paiement introuvable.';
      this.cdr.detectChanges();
      return;
    }
    
    console.log(`Retry attempt ${attempt + 1}/${maxAttempts} to find payment element container`);
    
    setTimeout(() => {
      const container = document.getElementById('payment-element');
      if (container) {
        console.log("Payment element container found on retry!");
        this.containerFound = true;
        this.mountStripeElements();
      } else {
        this.retryMounting(attempt + 1, maxAttempts);
      }
    }, 500);
  }

  processPayment(): void {
    console.log('Processing payment...');
    this.status = 'loading';
    this.message = 'Traitement du paiement en cours...';
    this.cdr.detectChanges();
    
    if (!this.stripe || !this.elements) {
      this.status = 'error';
      this.message = 'Erreur: Le système de paiement n\'est pas initialisé correctement.';
      this.cdr.detectChanges();
      return;
    }
    
    this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url: window.location.origin + `/admin/bill/payment-callback?bill_id=${this.billId}`,
      }
    }).then((result: any) => {
      if (result.error) {
        console.error('Payment confirmation error:', result.error);
        this.status = 'error';
        this.message = result.error.message || 'Une erreur est survenue lors du paiement.';
        this.cdr.detectChanges();
      }
      // La redirection sera gérée par Stripe si le paiement est réussi
    }).catch((err: any) => {
      console.error('Exception during payment confirmation:', err);
      this.status = 'error';
      this.message = 'Une erreur technique est survenue. Veuillez réessayer plus tard.';
      this.cdr.detectChanges();
    });
  }
  
  goToBill(): void {
    if (this.billId) {
      this.router.navigate(['/admin/bill/view', this.billId]);
    } else {
      this.router.navigate(['/admin/bill']);
    }
  }
  
  goToBillList(): void {
    this.router.navigate(['/admin/bill']);
  }
}
