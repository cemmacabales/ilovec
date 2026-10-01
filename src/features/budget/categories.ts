import {
  Basket,
  Car,
  FilmSlate,
  FirstAid,
  ForkKnife,
  Gift,
  Lightning,
  Airplane,
  Repeat,
  ShoppingBag,
  Sparkle,
  DotsThree,
  type Icon,
} from '@phosphor-icons/react';
import type { ExpenseCategory } from '../../data/budget';

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string; icon: Icon }[] = [
  { value: 'restaurants', label: 'Food & drinks', icon: ForkKnife },
  { value: 'entertainment', label: 'Movies & fun', icon: FilmSlate },
  { value: 'activities', label: 'Activities', icon: Sparkle },
  { value: 'travel', label: 'Travel', icon: Airplane },
  { value: 'gifts', label: 'Gifts', icon: Gift },
  { value: 'groceries', label: 'Groceries', icon: Basket },
  { value: 'transportation', label: 'Getting around', icon: Car },
  { value: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { value: 'subscriptions', label: 'Subscriptions', icon: Repeat },
  { value: 'utilities', label: 'Bills', icon: Lightning },
  { value: 'healthcare', label: 'Health', icon: FirstAid },
  { value: 'other', label: 'Other', icon: DotsThree },
];

export function categoryMeta(value: string) {
  return EXPENSE_CATEGORIES.find((c) => c.value === value) ?? EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];
}
