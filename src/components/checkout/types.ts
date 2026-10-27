export type CheckoutStep = 'modality' | 'participant' | 'review';

export interface ParticipantFormData {
  firstName: string;
  lastName: string;
  documentType: 'dni' | 'nie' | 'passport';
  document: string;
  birthDate: string;
  phone: string;
  club: string;
}
