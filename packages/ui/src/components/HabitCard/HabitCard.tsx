import { Edit2, Trash2, Flame } from "lucide-react";
import { Button } from "../../primitives/Button";
import { Card } from "../../primitives/Card";
import { Badge } from "../../primitives/Badge";
import { Progress } from "../../primitives/Progress";
import type { HabitCardProps } from "./HabitCard.types";

export function HabitCard({
  name,
  description,
  icon,
  trackingType,
  unit,
  targetCount,
  completed,
  value,
  currentStreak,
  completionRate = 0,
  onToggle,
  onValueUpdate,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const currentValue = value ?? 0;
  const counterProgress = targetCount ? (currentValue / targetCount) * 100 : 0;

  return (
    <Card className={`p-4 transition-all ${completed ? "bg-accent/50" : ""}`}>
      <div className="flex items-start gap-4">
        {/* Icon / status button */}
        <button
          onClick={() => {
            if (trackingType === "COMPLETED") onToggle?.();
            else onValueUpdate?.(currentValue);
          }}
          className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all ${
            completed
              ? "bg-gradient-to-br from-green-400 to-green-600 text-white scale-110"
              : "border-2 hover:scale-105"
          }`}
          style={{
            borderColor: !completed ? "var(--primary)" : undefined,
            backgroundColor: !completed ? "transparent" : undefined,
          }}
        >
          {completed ? "\u2713" : icon}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="font-semibold">{name}</h3>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 mt-2">
            {currentStreak > 0 && (
              <Badge variant="outline" className="gap-1">
                <Flame className="h-3 w-3 text-orange-500" />
                {currentStreak} day{currentStreak !== 1 ? "s" : ""}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {completionRate.toFixed(0)}% this week
            </span>
          </div>

          {/* Counter progress */}
          {trackingType === "COUNTER" && targetCount && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-muted-foreground">
                  {currentValue} / {targetCount} {unit}
                </span>
                <span className="font-medium">{Math.round(counterProgress)}%</span>
              </div>
              <Progress value={counterProgress} className="h-2" />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
