import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Hook pour gérer le retour haptique (vibrations) sur iOS et Android
 * Compatible avec les recommandations Apple Human Interface Guidelines
 */
export const useHaptics = () => {
  /**
   * Retour haptique léger - Pour des interactions subtiles
   * Exemples: Basculer un switch, sélectionner une option
   */
  const light = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  };

  /**
   * Retour haptique moyen - Pour des actions importantes
   * Exemples: Ajouter aux favoris, envoyer un message
   */
  const medium = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  };

  /**
   * Retour haptique fort - Pour des actions critiques
   * Exemples: Supprimer une annonce, confirmer une transaction
   */
  const heavy = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  };

  /**
   * Retour haptique de succès - Pour confirmer une action réussie
   * Exemples: Annonce publiée, paiement réussi
   */
  const success = async () => {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  };

  /**
   * Retour haptique d'avertissement - Pour alerter l'utilisateur
   * Exemples: Formulaire incomplet, action risquée
   */
  const warning = async () => {
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  };

  /**
   * Retour haptique d'erreur - Pour signaler une erreur
   * Exemples: Échec de connexion, validation échouée
   */
  const error = async () => {
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  };

  /**
   * Retour haptique de sélection - Pour la sélection dans une liste
   * Exemples: Scroll picker, navigation entre éléments
   */
  const selection = async () => {
    try {
      await Haptics.selectionStart();
      await Haptics.selectionChanged();
      await Haptics.selectionEnd();
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  };

  return {
    light,
    medium,
    heavy,
    success,
    warning,
    error,
    selection,
  };
};
