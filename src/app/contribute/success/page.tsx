"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

const ContributeSuccessPage = () => {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6">
      <div className="w-full rounded-xl border border-border/60 bg-card p-8 shadow-sm text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Registration successful
        </h1>
        <p className="mt-3 text-muted-foreground">
          Your dataset has been registered and mapped. You can now explore your dataset in the{" "}
          <strong className="text-foreground">Dataset catalog</strong>.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/datasets">
              <Database className="h-5 w-5" />
              Explore Dataset catalog
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contribute">Register another dataset</Link>
          </Button>
        </div>
      </div>
    </main>
  );
};

export default ContributeSuccessPage;
