import { apiClient, ApiEnvelope, ApiError } from '@/services/client';
import { loginAction, logoutAction, type ILoginPayload } from '@/actions/auth-action';

interface IRegisterPayload {
    fullName: string;
    displayName: string;
    email: string;
    password: string;
    birthday: Date;
    country: string;
    gender: string;
}

export const authService = {
    async register(payload: IRegisterPayload): Promise<ApiEnvelope<null>> {
        try {
            return await apiClient.post<null>('/api/auth/register', payload);
        } catch (error) {
            if (error instanceof ApiError && error.payload) {
                return error.payload as ApiEnvelope<null>;
            }

            return {
                success: false,
                timestamp: new Date().toISOString(),
                message: 'Cannot connect to server',
                data: null,
            };
        }
    },

    async login(payload: ILoginPayload): Promise<ApiEnvelope<null>> {
        return loginAction(payload);
    },

    async logout(): Promise<{ success: boolean }> {
        return logoutAction();
    },
};
