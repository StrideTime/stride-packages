import { useState, useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { SplashScreen } from "./SplashScreen";

const meta: Meta<typeof SplashScreen> = {
  title: "Components/SplashScreen",
  component: SplashScreen,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  args: {
    loading: false,
    onComplete: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof SplashScreen>;

/** Default — animation plays then fades out after min display time. */
export const Default: Story = {
  args: {
    loading: false,
    onComplete: fn(),
  },
};

/** Loading state — animation plays and holds until loading finishes. */
export const Loading: Story = {
  args: {
    loading: true,
    onComplete: fn(),
  },
};

/** Simulates a real app load: loading is true for 1.5s then flips to false. */
export const SimulatedLoad: Story = {
  render: () => {
    const [loading, setLoading] = useState(true);
    const [done, setDone] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setLoading(false), 1500);
      return () => clearTimeout(timer);
    }, []);

    if (done) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            fontFamily: "Inter, system-ui, sans-serif",
            color: "hsl(var(--color-foreground))",
          }}
        >
          <p style={{ fontSize: "1.25rem", fontWeight: 500 }}>App loaded!</p>
        </div>
      );
    }

    return <SplashScreen loading={loading} onComplete={() => setDone(true)} />;
  },
};

/** Slow load — loading stays true for 5s to show the animation holds. */
export const SlowLoad: Story = {
  render: () => {
    const [loading, setLoading] = useState(true);
    const [done, setDone] = useState(false);

    useEffect(() => {
      const timer = setTimeout(() => setLoading(false), 5000);
      return () => clearTimeout(timer);
    }, []);

    if (done) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            fontFamily: "Inter, system-ui, sans-serif",
            color: "hsl(var(--color-foreground))",
          }}
        >
          <p style={{ fontSize: "1.25rem", fontWeight: 500 }}>App loaded after 5s!</p>
        </div>
      );
    }

    return <SplashScreen loading={loading} onComplete={() => setDone(true)} />;
  },
};
