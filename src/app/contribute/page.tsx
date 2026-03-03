"use client";

import React from "react";
import DatasetRegistration from "./DatasetRegistraiton";

const Page = () => {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Register your dataset
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground sm:text-base">
          Contribute any biodiversity, ecological, health, climate, or related dataset to the CML catalog.
          You can register datasets from any category or data source, then optionally map their fields to shared
          ontology terms so they are easier to discover and reuse.
        </p>
      </header>

      <section>
        <DatasetRegistration />
      </section>
    </main>
  );
};

export default Page;
