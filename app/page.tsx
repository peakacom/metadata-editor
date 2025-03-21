"use client";

import { Environment, getEnvironment, ZIPY_KEY } from "@/config/config";
import { useGetProjectInfoQuery } from "@/services/partner";
import { Path } from "@/services/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import zipy from "zipyai";

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

  useEffect(() => {
    if (getEnvironment() !== Environment.TEST) {
      zipy
        .init(ZIPY_KEY)
        .then(() => {
          if (projectInfo) {
            zipy.identify(projectInfo.email, {
              email: projectInfo.email,
              customerName: `Project Name: ${projectInfo.projectName}`,
            });
          }
        })
        .catch((err) => console.error(err));
    }
  }, [projectInfo]);
}
