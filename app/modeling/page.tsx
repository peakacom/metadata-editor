"use client";

import SchemaViewer from "@/components/SchemaViewer/SchemaViewer";
import { useGetProjectInfoQuery } from "@/services/partner";
import { Path } from "@/services/types";
import { ReactFlowProvider } from "@xyflow/react";
import { Spin } from "antd";
import { useRouter } from "next/navigation";
import { LoadingOutlined } from "@ant-design/icons";

export default function Modeling() {
  const { data: projectInfo, isLoading: isProjectInfoLoading } =
    useGetProjectInfoQuery({});
  const router = useRouter();

  if (isProjectInfoLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Spin indicator={<LoadingOutlined spin />} size="large" />
      </div>
    );
  }

  if (!isProjectInfoLoading && !projectInfo) {
    router.push(Path.Settings);
    return null;
  }

  return (
    <ReactFlowProvider>
      <SchemaViewer projectId={projectInfo ? projectInfo.projectId : ""} />
    </ReactFlowProvider>
  );
}
