import { useState, useEffect } from 'react';
import { Coffee, Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../../primitives/Button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../../primitives/Dialog';
export type EditBreakDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  durationMinutes: number;
  onApply: (newDuration: number) => void;
  onDelete: () => void;
};

export function EditBreakDialog({ open, onOpenChange, durationMinutes, onApply, onDelete }: EditBreakDialogProps) {
  const [duration, setDuration] = useState(durationMinutes);

  useEffect(() => {
    if (open) setDuration(durationMinutes);
  }, [open, durationMinutes]);

  const handleDecrease = () => setDuration(d => Math.max(5, d - 5));
  const handleIncrease = () => setDuration(d => Math.min(120, d + 5));
  const handlePreset = (m: number) => setDuration(m);
  const handleApply = () => onApply(duration);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[260px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coffee className="h-4 w-4 text-muted-foreground" />
            Break
          </DialogTitle>
        </DialogHeader>
        <div className="py-1 space-y-4">
          <div className="flex gap-1.5">
            {[5, 10, 15, 30].map(m => (
              <Button
                key={m}
                variant={duration === m ? 'default' : 'outline'}
                size="sm"
                className="flex-1 text-xs px-0"
                onClick={() => handlePreset(m)}
              >
                {m}m
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={handleDecrease}
              disabled={duration <= 5}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-semibold tabular-nums">{duration}</span>
              <span className="text-sm text-muted-foreground ml-1.5">min</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={handleIncrease}
              disabled={duration >= 120}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="destructive" size="sm" className="mr-auto" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
            Delete
          </Button>
          <Button size="sm" onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
