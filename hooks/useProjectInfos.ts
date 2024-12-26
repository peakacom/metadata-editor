import { selectApiKey } from "@/services/apiKeySlice";
import { useLazyGetProjectInfoQuery } from "@/services/partner";
import { ProjectInfo } from "@/services/types";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function useProjectInfos() {
  const [projectInfos, setProjectInfos] = useState<{
    [key: string]: ProjectInfo;
  }>({});
  const apiKeyState = useSelector(selectApiKey);
  const [getProjectInfo] = useLazyGetProjectInfoQuery();

  useEffect(() => {
    const fetchData = async () => {
      const apiKeys = apiKeyState.apiKeys;
      if (!apiKeys) {
        return;
      }
      const fetchedProjectInfos: { [key: string]: ProjectInfo } = {};

      for (const apiKey of apiKeys) {
        const projectInfo = await getProjectInfo({ apiKey: apiKey }).unwrap();
        fetchedProjectInfos[apiKey] = projectInfo;
      }

      setProjectInfos(fetchedProjectInfos);
    };

    fetchData().catch(console.error);
  }, [apiKeyState.apiKeys, getProjectInfo]);

  return projectInfos;
}
