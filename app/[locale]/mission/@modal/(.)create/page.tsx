"use client";

import MissionCreateForm from "../../_components/MissionCreateForm";
import { useMissionCreateDone } from "./MissionCreateSheet";

export default function InterceptedMissionCreatePage() {
  const onDone = useMissionCreateDone();
  return <MissionCreateForm onDone={onDone} />;
}
