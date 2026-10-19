'use client';

import { ReactNode } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { Typography } from "@/components/ui/typography";

interface InstructionPopoverProps {
  title: string;
  icon?: ReactNode;
  children?: ReactNode;
}

const InstructionPopover: React.FC<InstructionPopoverProps> = ({ title, icon, children }) => {
  const infoButton =
    children != null ? (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={icon ? 'ghost' : 'outline'}
            size="icon"
            className={icon ? 'h-7 w-7 shrink-0' : undefined}
            aria-label={`About ${title}`}
          >
            <Info className={icon ? 'h-3.5 w-3.5 text-muted-foreground' : 'h-4 w-4'} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] text-sm" side="bottom" align="start">
          {children}
        </PopoverContent>
      </Popover>
    ) : null;

  if (icon != null) {
    return (
      <div className="flex items-center gap-2 min-w-0 shrink">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </div>
        <Typography variant="h4" as="h1" tone="default" truncate>{title}</Typography>
        {infoButton}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <Typography variant="h3" as="h2" className="text-xl">{title}</Typography>
      {infoButton}
    </div>
  );
};

export default InstructionPopover;
