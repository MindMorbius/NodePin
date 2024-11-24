import { AuthSlice } from './slices/authSlice';
import { I18nSlice } from './slices/i18nSlice';
import { SubscriptionSlice } from './slices/subscriptionSlice';
import { SupabaseSlice } from './slices/supabaseSlice';
import { UserSlice } from './slices/userSlice';

export interface StoreState extends 
  AuthSlice,
  I18nSlice,
  SubscriptionSlice,
  SupabaseSlice,
  UserSlice {} 