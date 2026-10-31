import * as React from "react";
import { Card, CardContent } from "../ui/Card";
import { Link } from "../ui/Link";
import { AlertCircle } from "lucide-react";

interface ComingSoonProps {
  feature: string;
  note?: string;
}

export const ComingSoon = React.memo(function ComingSoon({ feature, note }: ComingSoonProps) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-8 md:p-12">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="h-6 w-6 text-deep" aria-hidden="true" />
          <h2 className="text-section font-serif text-ink">{feature} — coming soon</h2>
        </div>
        <p className="text-ink/70 mb-6">
          {note || "This feature is being built in the next development milestone."}
        </p>
        <Link to="/dashboard" className="inline-block px-4 py-2 text-xs font-medium text-deep bg-rose rounded-lg hover:bg-deep hover:text-white transition-colors">
          Return to dashboard
        </Link>
      </CardContent>
    </Card>
  );
});