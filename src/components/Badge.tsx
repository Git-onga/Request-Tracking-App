import type { SubmissionType, Priority, Status } from '../types';

type BadgeVariant = SubmissionType | Priority | Status;

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`badge badge-${variant}`}>
      {children}
    </span>
  );
}
