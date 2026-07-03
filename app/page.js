import RaidBoard from "./raid-board";
import { getRaidData } from "../lib/raidData";

export default function Home() {
  return <RaidBoard data={getRaidData()} />;
}
