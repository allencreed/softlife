import { Shield, CreditCard, RefreshCw } from "lucide-react";

export function TrustBadges() {
  return (
    <div className="mt-6 rounded-[18px] border border-hairline bg-white p-5">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-ink-muted-48">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span>Secure checkout</span>
        </div>
        <div className="hidden sm:block h-4 w-px bg-hairline" />
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          <span>Visa &middot; MC &middot; Amex &middot; PayPal</span>
        </div>
        <div className="hidden sm:block h-4 w-px bg-hairline" />
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          <span>30-day returns</span>
        </div>
      </div>
    </div>
  );
}
