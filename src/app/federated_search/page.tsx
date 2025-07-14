'use client';

import React from 'react';
import FederatedSearchBar from '@/app/federated_search/FederatedSearchBar';
import FederatedDataTable from '@/app/federated_search/FederatedDataTable';
import InstructionPopover from '@/element/popover/InstructionPopover';

const Page = () => {

  return (
    <div className="p-4 space-y-2">

      <InstructionPopover title="Federated Search">
        <p>
          Federated Search queries multiple remote databases and returns unified results in a single view.
        </p>
      </InstructionPopover>
      <FederatedSearchBar />
      <FederatedDataTable />
    </div>
  );
};

export default Page;
