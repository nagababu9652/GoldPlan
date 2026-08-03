export interface BaseColumnProps {
  className?: string;
}

export interface TextColumnProps extends BaseColumnProps {
  value?: string | null;
}

export interface CurrencyColumnProps extends BaseColumnProps {
  value?: number;
  currency?: string;
}

export interface StatusColumnProps extends BaseColumnProps {
  value: string;
}

export interface ProgressColumnProps extends BaseColumnProps {
  value: number;
}

export interface AvatarColumnProps extends BaseColumnProps {
  name: string;
  image?: string;
}