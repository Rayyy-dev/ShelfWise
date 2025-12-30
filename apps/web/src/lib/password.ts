import { Check, X } from 'lucide-react';

export interface PasswordStrength {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
}

export function getPasswordStrength(password: string): PasswordStrength {
  return {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
}

export function isPasswordValid(strength: PasswordStrength): boolean {
  return strength.hasMinLength && strength.hasUppercase && strength.hasLowercase && strength.hasNumber;
}

interface PasswordRequirementProps {
  met: boolean;
  text: string;
}

export function PasswordRequirement({ met, text }: PasswordRequirementProps) {
  return (
    <div className={`flex items-center gap-2 text-xs ${met ? 'text-emerald-600' : 'text-slate-400'}`}>
      {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {text}
    </div>
  );
}
