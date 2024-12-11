"use client";

import { useGetProjectInfoQuery } from "@/services/partner";
import { Path } from "@/services/types";
import { useRouter } from "next/navigation";

export default function App() {
  const { data: projectInfo, isLoading: isProjectInfoLoading } =
    useGetProjectInfoQuery({});
  const router = useRouter();

  if (!isProjectInfoLoading && !projectInfo) {
    router.push(Path.Settings);
  }

  if (!isProjectInfoLoading && projectInfo) {
    router.push(Path.Modeling);
  }
}
