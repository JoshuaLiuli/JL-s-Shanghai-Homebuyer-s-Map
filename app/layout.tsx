import type { Metadata } from "next";
import "./globals.css";

const siteUrl =
  "https://joshualiuli.github.io/JL-s-Shanghai-Homebuyer-s-Map/";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "上海购房研究地图",
  description: "Joshua 的生活圈、小区与证据研究驾驶舱",
  icons: {
    icon: `${siteUrl}favicon.svg`,
    shortcut: `${siteUrl}favicon.svg`,
  },
  openGraph: {
    title: "上海购房研究地图",
    description: "生活圈 · 小区 · 证据 · 决策",
    url: siteUrl,
    images: [`${siteUrl}og.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "上海购房研究地图",
    description: "生活圈 · 小区 · 证据 · 决策",
    images: [`${siteUrl}og.png`],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
