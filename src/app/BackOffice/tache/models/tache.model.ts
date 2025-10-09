export interface Tache {
  id: number;
  titre: string;
  nom?: string;
  description: string;
  statut: string;
  priorite: string;
  dateDebut: Date;
  dateFin: Date;
  projet: {
    id: number;
  };
  responsable: {
    id: number;
  };
} 