import { useState, useMemo } from "react";
import {
  Activity,
  Apple,
  Award,
  Baby,
  Backpack,
  Banknote,
  Bath,
  Battery,
  Bed,
  Beer,
  Bell,
  Bike,
  Book,
  BookOpen,
  Bookmark,
  Box,
  Brain,
  Briefcase,
  Bug,
  Building,
  Calculator,
  Calendar,
  Camera,
  Car,
  Carrot,
  Cat,
  CheckCircle,
  ChefHat,
  Cigarette,
  Circle,
  Clipboard,
  Clock,
  Cloud,
  CloudSun,
  Code,
  Coffee,
  Compass,
  Cookie,
  Crown,
  CupSoda,
  Database,
  Dog,
  Dumbbell,
  Droplet,
  Feather,
  Film,
  Flag,
  Flame,
  Flower,
  Footprints,
  Frown,
  Gamepad2,
  Gift,
  Glasses,
  Globe,
  GraduationCap,
  Hammer,
  Hand,
  Headphones,
  Heart,
  HeartPulse,
  Home,
  IceCream,
  Image,
  Laptop,
  Laugh,
  Leaf,
  Lightbulb,
  Mail,
  Map,
  Megaphone,
  Meh,
  MessageCircle,
  Mic,
  Moon,
  Mountain,
  Music,
  Newspaper,
  Palette,
  Paperclip,
  Pencil,
  Phone,
  PieChart,
  Pill,
  Pizza,
  Plane,
  Play,
  Recycle,
  Rocket,
  Salad,
  Scale,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Smile,
  Snowflake,
  Sparkles,
  Speaker,
  Sprout,
  Star,
  Stethoscope,
  Sun,
  Sunrise,
  Sunset,
  Sword,
  Target,
  Thermometer,
  ThumbsUp,
  Timer,
  Train,
  Trash,
  TreeDeciduous,
  TrendingUp,
  Trophy,
  Tv,
  Umbrella,
  Users,
  Utensils,
  Video,
  Wallet,
  Watch,
  Waves,
  Wind,
  Wine,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../../primitives/Popover";
import { Button } from "../../primitives/Button";
import { Input } from "../../primitives/Input";
import { ScrollArea } from "../../primitives/ScrollArea";
import { Label } from "../../primitives/Label";
import type { IconPickerProps } from "./IconPicker.types";

// Curated icon set for habits and activities
const ICON_SET: Record<string, LucideIcon> = {
  Activity,
  Apple,
  Award,
  Baby,
  Backpack,
  Banknote,
  Bath,
  Battery,
  Bed,
  Beer,
  Bell,
  Bike,
  Book,
  BookOpen,
  Bookmark,
  Box,
  Brain,
  Briefcase,
  Bug,
  Building,
  Calculator,
  Calendar,
  Camera,
  Car,
  Carrot,
  Cat,
  CheckCircle,
  ChefHat,
  Cigarette,
  Circle,
  Clipboard,
  Clock,
  Cloud,
  CloudSun,
  Code,
  Coffee,
  Compass,
  Cookie,
  Crown,
  CupSoda,
  Database,
  Dog,
  Dumbbell,
  Droplet,
  Feather,
  Film,
  Flag,
  Flame,
  Flower,
  Footprints,
  Frown,
  Gamepad2,
  Gift,
  Glasses,
  Globe,
  GraduationCap,
  Hammer,
  Hand,
  Headphones,
  Heart,
  HeartPulse,
  Home,
  IceCream,
  Image,
  Laptop,
  Laugh,
  Leaf,
  Lightbulb,
  Mail,
  Map,
  Megaphone,
  Meh,
  MessageCircle,
  Mic,
  Moon,
  Mountain,
  Music,
  Newspaper,
  Palette,
  Paperclip,
  Pencil,
  Phone,
  PieChart,
  Pill,
  Pizza,
  Plane,
  Play,
  Recycle,
  Rocket,
  Salad,
  Scale,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Smile,
  Snowflake,
  Sparkles,
  Speaker,
  Sprout,
  Star,
  Stethoscope,
  Sun,
  Sunrise,
  Sunset,
  Sword,
  Target,
  Thermometer,
  ThumbsUp,
  Timer,
  Train,
  Trash,
  TreeDeciduous,
  TrendingUp,
  Trophy,
  Tv,
  Umbrella,
  Users,
  Utensils,
  Video,
  Wallet,
  Watch,
  Waves,
  Wind,
  Wine,
  Wrench,
  Zap,
};

// Predefined color palette
const COLOR_PALETTE = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange
  "#6366f1", // indigo
  "#14b8a6", // teal
  "#a855f7", // violet
  "#64748b", // slate
  "#78716c", // stone
];

/**
 * IconPicker — Select an icon and color for habits, projects, etc.
 * Uses lucide-react icons with a searchable grid interface.
 */
export function IconPicker({
  value = { icon: "Star", color: "#3b82f6" },
  onValueChange,
  triggerLabel,
  disabled = false,
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedColor, setSelectedColor] = useState(value.color);

  const SelectedIcon = ICON_SET[value.icon] || Star;

  // Filter icons based on search
  const filteredIcons = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return Object.keys(ICON_SET);
    return Object.keys(ICON_SET).filter((name) => name.toLowerCase().includes(query));
  }, [search]);

  const handleIconSelect = (iconName: string) => {
    onValueChange?.({ icon: iconName, color: selectedColor });
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    onValueChange?.({ icon: value.icon, color });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearch(""); // Clear search when popover closes
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" disabled={disabled} className="h-10 gap-2">
          <div
            className="flex h-5 w-5 items-center justify-center rounded"
            style={{ backgroundColor: `${value.color}20`, color: value.color }}
          >
            <SelectedIcon className="h-4 w-4" />
          </div>
          <span>{triggerLabel || value.icon}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="flex flex-col gap-3 p-3">
          {/* Search */}
          <div>
            <Input
              placeholder="Search icons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9"
            />
          </div>

          {/* Icon Grid */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Icon</Label>
            <div className="h-[200px] w-full rounded-md border overflow-hidden">
              <ScrollArea className="h-full w-full">
                <div className="grid grid-cols-6 gap-1 p-2">
                  {filteredIcons.map((iconName) => {
                    const Icon = ICON_SET[iconName];
                    const isSelected = value.icon === iconName;
                    return (
                      <button
                        key={iconName}
                        onClick={() => handleIconSelect(iconName)}
                        className={`flex h-10 w-10 items-center justify-center rounded-md transition-colors hover:bg-accent ${
                          isSelected ? "bg-primary text-primary-foreground" : ""
                        }`}
                        title={iconName}
                      >
                        <Icon className="h-5 w-5" />
                      </button>
                    );
                  })}
                </div>
                {filteredIcons.length === 0 && (
                  <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                    No icons found
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Color</Label>
            <div className="grid grid-cols-7 gap-2">
              {COLOR_PALETTE.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`h-8 w-8 rounded-md transition-all hover:scale-110 ${
                      isSelected ? "ring-2 ring-offset-2 ring-primary" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                );
              })}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-2 rounded-md border p-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${selectedColor}20`, color: selectedColor }}
            >
              <SelectedIcon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">{value.icon}</div>
              <div className="text-xs text-muted-foreground">{selectedColor}</div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
