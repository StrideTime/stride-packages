import { SvgIcon, SvgIconProps } from "@mui/material";
import LogoFullSvg from "./assets/logo-full.svg?react";

export const LogoFull = (props: SvgIconProps) => {
  return <SvgIcon component={LogoFullSvg} {...props} />;
};
