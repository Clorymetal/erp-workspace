import { getSupplierBalance } from '../services/providerService';

/**
 * API Interna Exclusiva para otros Módulos (Ej: Contabilidad, RRHH).
 * No expone datos sensibles, y los contratos de retorno (DTOs) nunca deben romperse.
 */

// Retorna únicamente el ID y el saldo adeudado.
export const getSafeProviderBalance = async (providerId: string): Promise<{ providerId: string, balance: number }> => {
    return await getSupplierBalance(providerId);
};
