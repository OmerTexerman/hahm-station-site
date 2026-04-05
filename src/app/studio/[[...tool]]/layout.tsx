import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HAHM Station Studio",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div style={{ minHeight: "100vh" }}>{children}</div>;
}
