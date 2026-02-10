import { Button, ButtonProps } from '@mui/material';

export interface CTAButtonProps extends Omit<ButtonProps, 'variant' | 'size'> {
  variant?: 'primary' | 'secondary';
  size?: 'medium' | 'large';
}

export const CTAButton = ({
  variant = 'primary',
  size = 'large',
  children,
  ...props
}: CTAButtonProps) => {
  const muiVariant = variant === 'primary' ? 'contained' : 'outlined';

  return (
    <Button
      variant={muiVariant}
      size={size}
      sx={{
        px: size === 'large' ? 4 : 3,
        py: size === 'large' ? 1.5 : 1,
        fontSize: size === 'large' ? '1.125rem' : '1rem',
        fontWeight: 600,
        borderRadius: 2,
        textTransform: 'none',
        boxShadow: variant === 'primary' ? 2 : 0,
        '&:hover': {
          boxShadow: variant === 'primary' ? 4 : 0,
        },
      }}
      {...props}
    >
      {children}
    </Button>
  );
};
