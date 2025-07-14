'use client';

import { ReactNode } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface InstructionPopoverProps {
  title: string;
  children: ReactNode;
}

const InstructionPopover: React.FC<InstructionPopoverProps> = ({ title, children }) => (
  <div className="flex items-center space-x-4">
    <h2 className="text-xl font-semibold">{title}</h2>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" aria-label={`About ${title}`}>
          <Info className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] text-sm text-gray-700">
        {children}
      </PopoverContent>
    </Popover>
  </div>
);

export default InstructionPopover;
