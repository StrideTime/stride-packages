import { SvgIcon, SvgIconProps } from "@mui/material";
import LogoSvg from "./assets/logo.svg?react";

export const Logo = (props: SvgIconProps) => {
  return <SvgIcon component={LogoSvg} {...props} />;
};
