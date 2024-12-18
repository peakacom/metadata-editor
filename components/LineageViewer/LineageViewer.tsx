import { DBMetaDataColumnLineage } from "@/services/types";
import { useEffect, useState } from "react";
import MermaidDiagram from "./Mermaid";
export interface LineageViewerProps {
  data?: DBMetaDataColumnLineage[];
}

export default function LineageViewer({ data }: LineageViewerProps) {
  const [diagram, setDiagram] = useState("");
  useEffect(() => {
    if (data) {
      let diagram = "flowchart LR\n";

      data.forEach((item, index) => {
        const line = `${index}["\`<b>Column:</b>${item.column}
        <b>Expression:</b>${item.expression}\`"]`;
        diagram += line + "\n";
      });
      let itemCount = data.length;
      while (itemCount > 1) {
        diagram += `${itemCount - 2} --> ${itemCount - 1}\n`;
        itemCount--;
      }
      itemCount = data.length;
      while (itemCount > 0) {
        diagram += `style ${itemCount - 1}  text-align:left !important;\n`;
        itemCount--;
      }
      setDiagram(diagram);
    }
  }, [data]);

  return (
    <div>
      <MermaidDiagram>{diagram}</MermaidDiagram>
    </div>
  );
}
