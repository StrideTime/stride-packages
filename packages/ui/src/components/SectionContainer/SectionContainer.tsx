import { Container, SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';

export interface SectionContainerProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  sx?: SxProps<Theme>;
}

export const SectionContainer = ({
  children,
  maxWidth = 'lg',
  sx = {},
}: SectionContainerProps) => {
  return (
    <Container
      maxWidth={maxWidth}
      sx={{
        py: { xs: 8, md: 12 },
        ...sx,
      }}
    >
      {children}
    </Container>
  );
};
