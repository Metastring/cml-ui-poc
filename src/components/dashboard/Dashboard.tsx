"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  Globe,
  LocateFixed,
  DatabaseZap,
  FileText,
  FileSearch,
  Users,
  Layers,
  ArrowRight,
  Sparkles,
  // Share2,
} from "lucide-react";
import { useGetPlatformStatistics } from "@/api/dashboard/DashboardApiHandler";
import { Typography } from "@/components/ui/typography";

const formatNumber = (value: number | undefined | null) => {
  if (value === undefined || value === null) return "—";
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);
  return value === 0 ? formatted : `${formatted}+`;
};

const actions = [
  {
    title: "Explore Datasets",
    description:
      "Query multiple remote databases and get unified results in a single view.",
    href: "/federated_search",
    icon: Globe,
  },
  {
    title: "Map Search",
    description:
      "View layers, draw polygons on the map and explore available spatial data.",
    href: "/map_search",
    icon: LocateFixed,
  },
  {
    title: "Register your dataset",
    description: "Contribute and register your biodiversity or ecological dataset.",
    href: "/contribute",
    icon: DatabaseZap,
  },
  {
    title: "Dataset catalog",
    description: "Browse and explore the full catalog of registered datasets.",
    href: "/datasets",
    icon: FileText,
  },
  {
    title: "Metadata Search",
    description: "Search and discover datasets by metadata and attributes.",
    href: "/metadata_search",
    icon: FileSearch,
  },
  // {
  //   title: "Federated Sources",
  //   description: "View all federated data sources connected to the platform.",
  //   href: "/federated_sources",
  //   icon: Share2,
  // },
];

const Dashboard = () => {
  const { data: statsData, isLoading } = useGetPlatformStatistics();

  const stats = [
    {
      label: "Datasets",
      value: formatNumber(statsData?.total_datasets),
      icon: Layers,
      description: "Federated sources",
    },
    {
      label: "Contributors",
      value: formatNumber(statsData?.contributors),
      icon: Users,
      description: "Research & citizen science",
    },
  ];

  return (
    <div className="min-h-full bg-background">
      {/* Hero */}
      <header className="relative border-b border-border/60 bg-gradient-to-b from-primary/5 via-transparent to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium mb-3">
            <Sparkles className="size-4 text-primary" aria-hidden />
            <span>CML</span>
          </div>
          <Typography variant="h1" tone="default" className="text-4xl mb-4 lg:text-hero">
            Cataloging and Mapping Life of India
          </Typography>
          <Typography variant="lead" tone="muted" className="mt-3 max-w-2xl">
          An ontology driven federated data platform for discovering, sharing, and collaborating on FAIR social, ecological, health, and biodiversity data.
          Search across domains, explore connections between datasets, and contribute to a unified view of life across the subcontinent.
          </Typography>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link href="/federated_search">
                Explore datasets
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/datasets">Browse catalog</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <section className="mb-10">
          <Typography variant="inherit" as="h2" className="sr-only">Overview</Typography>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ label, value, icon: Icon, description }) => (
              <Card
                key={label}
                className="border-border/60 bg-card transition-shadow hover:shadow-md"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-muted-foreground text-sm font-medium">
                    {label}
                  </CardTitle>
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Icon className="size-4" aria-hidden />
                  </div>
                </CardHeader>
                <CardContent>
                  <Typography variant="h3" as="p" tone="default" className="text-2xl">
                    {isLoading ? "…" : value}
                  </Typography>
                  <Typography variant="small" tone="muted">{description}</Typography>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Tools & actions */}
        <section>
          <Typography variant="h3" as="h2" tone="default" className="mb-4">
            Tools & resources
          </Typography>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map(({ title, description, href, icon: Icon }) => (
              <Link key={href} href={href} className="group block">
                <Card className="h-full border-border/60 bg-card transition-all hover:border-primary/30 hover:shadow-md group-hover:border-primary/40">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0">
                    <div className="rounded-lg bg-primary/10 p-2.5 text-primary group-hover:bg-primary/20 transition-colors">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100 group-hover:translate-x-0.5" />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardTitle className="text-foreground text-base">
                      {title}
                    </CardTitle>
                    <CardDescription className="mt-1.5 line-clamp-2">
                      {description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer note */}
        <Typography variant="body" tone="muted" align="center" className="mt-10">
          CML brings together species, ecological and climate data from
          multiple sources. Use the dataset explorer for cross-database queries or
          map search for spatial exploration.
        </Typography>
      </main>
    </div>
  );
};

export default Dashboard;
