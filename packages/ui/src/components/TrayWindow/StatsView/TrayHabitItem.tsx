import { Flame, ChevronDown, ChevronUp, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../primitives/Button";
import { Input } from "../../../primitives/Input";
import { Card } from "../../../primitives/Card";
import type { TrayHabitItemProps } from "./TrayHabitItem.types";

export function TrayHabitItem({
  name,
  icon,
  trackingType,
  unit,
  targetCount,
  completed,
  value,
  currentStreak,
  onToggle,
  onUpdateValue,
}: TrayHabitItemProps) {
  const [editing, setEditing] = useState(false);
  const currentValue = value ?? 0;

  const handleClick = () => {
    if (trackingType === "COMPLETED") {
      onToggle();
    } else {
      setEditing(!editing);
    }
  };

  return (
    <Card
      className={`overflow-hidden transition-all p-3 cursor-pointer ${
        completed ? "bg-green-500/10 border-green-500/40" : "hover:bg-accent/50"
      }`}
    >
      <button onClick={handleClick} className="w-full text-left">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center text-lg border-2 border-muted-foreground/30">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">{name}</div>
            <div className="flex items-center gap-2 mt-0.5">
              {currentStreak > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Flame className="h-3 w-3 text-orange-500" />
                  {currentStreak} day{currentStreak !== 1 ? "s" : ""}
                </div>
              )}
              {trackingType === "COUNTER" && targetCount != null && (
                <span className="text-xs text-muted-foreground">
                  {currentValue}/{targetCount} {unit}
                </span>
              )}
            </div>
          </div>
          {/* Toggle indicator */}
          <div
            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
              completed ? "bg-green-500 border-green-500" : "border-muted-foreground/30"
            }`}
          >
            {completed && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
          </div>
        </div>
      </button>

      {/* Counter input */}
      {editing && trackingType === "COUNTER" && (
        <div className="border-t mt-3 pt-3 -mx-3 px-3 -mb-3 pb-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateValue(Math.max(0, currentValue - 1));
                }}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={currentValue}
                onChange={(e) => onUpdateValue(parseFloat(e.target.value) || 0)}
                onClick={(e) => e.stopPropagation()}
                placeholder="0"
                className="text-center text-lg h-10 flex-1"
                autoFocus
              />
              <Button
                variant="outline"
                size="sm"
                className="h-10 w-10 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateValue(currentValue + 1);
                }}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 20, 50].map((inc) => (
                <Button
                  key={inc}
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateValue(currentValue + inc);
                  }}
                >
                  +{inc}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
