import { AuthSlice } from './slices/authSlice';
import { I18nSlice } from './slices/i18nSlice';
import { SubscriptionSlice } from './slices/subscriptionSlice';

export interface StoreState extends 
  AuthSlice,
  I18nSlice,
  SubscriptionSlice {} 