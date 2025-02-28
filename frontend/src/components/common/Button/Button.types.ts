import * as Headless from '@headlessui/react';
import { Link } from '../Link/Link';
import { styles } from './Button.styles';
export type ButtonProps = (
  | {
      color?: keyof typeof styles.colors;
      outline?: never;
      plain?: never;
    }
  | { color?: never; outline: true; plain?: never }
  | { color?: never; outline?: never; plain: true }
  | { color?: never; outline?: never; plain?: never }
) & { className?: string; children: React.ReactNode } & (
    | Omit<Headless.ButtonProps, 'as' | 'className'>
    | Omit<React.ComponentPropsWithoutRef<typeof Link>, 'className'>
  );
