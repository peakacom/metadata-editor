import { useCallback, useEffect, useState } from "react";
import mermaid, { RenderResult } from "mermaid";

import React from "react";
import { MouseEvent } from "react";
export interface MermaidDiagramProps {
  children: string;
  id?: string;
  testId?: string;
  className?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onError?: (error: unknown) => void;
}
export default function MermaidDiagram(props: MermaidDiagramProps) {
  const [element, setElement] = useState<HTMLDivElement>();
  const [render_result, setRenderResult] = useState<RenderResult>();

  const container_id = `${props.id || "d" + Date.now()}-mermaid`;
  const diagram_text = props.children;

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "forest",
      themeVariables: {
        fontSize: "32px",
      },
      logLevel: 5,
    });
  }, []);

  const updateDiagramRef = useCallback((elem: HTMLDivElement) => {
    if (!elem) return;
    setElement(elem);
  }, []);

  useEffect(() => {
    if (!element) return;
    if (!render_result?.svg) return;
    element.innerHTML = render_result.svg;
    render_result.bindFunctions?.(element);
  }, [element, render_result]);

  useEffect(() => {
    if (!diagram_text && diagram_text.length === 0) return;
    (async () => {
      try {
        const rr = await mermaid.render(`${container_id}-svg`, diagram_text);
        setRenderResult(rr);
      } catch (e: unknown) {
        props.onError?.(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diagram_text]);

  return (
    <div
      className={props.className}
      onClick={props.onClick}
      id={container_id}
      data-testid={props.testId}
      ref={updateDiagramRef}
    />
  );
}
