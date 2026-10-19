import { Typography } from "@/components/ui/typography";

export default function FederatedSearchRecordsPage() {
  return (
    <div className="min-h-full p-6 max-w-2xl">
      <Typography variant="h3" as="h1" tone="default" className="text-xl mb-3">
        Records
      </Typography>
      <Typography variant="inherit" tone="muted">
        This page will show information about the
        records related to the particular indicator.
      </Typography>
    </div>
  );
}
