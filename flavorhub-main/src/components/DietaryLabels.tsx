import { Leaf, WheatOff, Nut, Milk, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DietaryLabelsProps {
  isVegan?: boolean;
  isGlutenFree?: boolean;
  containsNuts?: boolean;
  containsDairy?: boolean;
  allergenInfo?: string | null;
  size?: 'sm' | 'md';
  showTooltips?: boolean;
}

const labels: { key: string; icon: typeof Leaf; label: string; color: string; warning?: boolean }[] = [
  { key: 'isVegan', icon: Leaf, label: 'Vegan', color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  { key: 'isGlutenFree', icon: WheatOff, label: 'Gluten-Free', color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
  { key: 'containsNuts', icon: Nut, label: 'Contains Nuts', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30', warning: true },
  { key: 'containsDairy', icon: Milk, label: 'Contains Dairy', color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', warning: true },
];

export function DietaryLabels({ 
  isVegan, 
  isGlutenFree, 
  containsNuts, 
  containsDairy, 
  allergenInfo,
  size = 'sm',
  showTooltips = true 
}: DietaryLabelsProps) {
  const values: Record<string, boolean | undefined> = {
    isVegan,
    isGlutenFree,
    containsNuts,
    containsDairy,
  };

  const activeLabels = labels.filter(l => values[l.key]);
  const hasAllergenInfo = allergenInfo && allergenInfo.trim().length > 0;

  if (activeLabels.length === 0 && !hasAllergenInfo) return null;

  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const badgeSize = size === 'sm' ? 'p-1' : 'p-1.5';

  const content = (
    <div className="flex flex-wrap gap-1">
      {activeLabels.map(({ key, icon: Icon, label, color, warning }) => {
        const badge = (
          <div
            key={key}
            className={cn(
              'rounded-full flex items-center justify-center transition-colors',
              badgeSize,
              color
            )}
            title={!showTooltips ? label : undefined}
          >
            <Icon className={iconSize} />
          </div>
        );

        if (showTooltips) {
          return (
            <TooltipProvider key={key} delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {badge}
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p className={cn(warning && 'text-orange-500 font-medium')}>
                    {warning && '⚠️ '}{label}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        return badge;
      })}

      {hasAllergenInfo && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'rounded-full flex items-center justify-center transition-colors',
                  badgeSize,
                  'text-red-600 bg-red-100 dark:bg-red-900/30'
                )}
              >
                <AlertTriangle className={iconSize} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs max-w-[200px]">
              <p className="text-red-500 font-medium">⚠️ Allergen Warning</p>
              <p className="text-muted-foreground">{allergenInfo}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );

  return content;
}
