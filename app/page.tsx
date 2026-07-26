import type { Metadata } from "next";
import { DecisionMap } from "./DecisionMap";

export const metadata: Metadata = {
  title: "上海购房研究地图",
  description: "Joshua 的生活圈、小区与证据研究驾驶舱",
};

export default function Home() {
  return <DecisionMap />;
}
