import { Toaster as Sonner } from "sonner";

export interface ToasterProps {
  theme?: "light" | "dark" | "system";
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center";
  expand?: boolean;
  richColors?: boolean;
  closeButton?: boolean;
}

export function Toaster({
  theme = "system",
  position = "bottom-right",
  expand = false,
  richColors = true,
  closeButton = false,
  ...props
}: ToasterProps) {
  return (
    <Sonner
      theme={theme}
      position={position}
      expand={expand}
      richColors={richColors}
      closeButton={closeButton}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}

export { toast } from "sonner";
