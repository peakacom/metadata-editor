import { DBMetaDataContainer, DBMetaRelationship } from "@/services/types";
import {
  TABLE_NODE_ROW_HEIGHT,
  TABLE_NODE_WIDTH,
  TableNodeData,
} from "./SchemaTableNode";
import { Edge, Node, Position } from "@xyflow/react";
import dagre from "@dagrejs/dagre";
import { ID_SEPARATOR_CHAR } from "@/config/config";

const NODE_SEP = 150;
const RANK_SEP = 300;

export async function getGraphDataFromTables(
  tables: DBMetaDataContainer[],
  relations: DBMetaRelationship[],
  onClick: (id: string) => void
): Promise<{
  nodes: Node<TableNodeData>[];
  edges: Edge[];
}> {
  const edges = relations.map((relation) => {
    return {
      id: `${relation.id}`,
      source: `${relation.projectId}${ID_SEPARATOR_CHAR}${relation.sourceCatalogId}${ID_SEPARATOR_CHAR}${relation.sourceSchemaName}${ID_SEPARATOR_CHAR}${relation.sourceTableName}`,
      sourceHandle: `${relation.projectId}${ID_SEPARATOR_CHAR}${relation.sourceCatalogId}${ID_SEPARATOR_CHAR}${relation.sourceSchemaName}${ID_SEPARATOR_CHAR}${relation.sourceTableName}${ID_SEPARATOR_CHAR}${relation.sourceColumnName}`,
      target: `${relation.projectId}${ID_SEPARATOR_CHAR}${relation.targetCatalogId}${ID_SEPARATOR_CHAR}${relation.targetSchemaName}${ID_SEPARATOR_CHAR}${relation.targetTableName}`,
      targetHandle: `${relation.projectId}${ID_SEPARATOR_CHAR}${relation.targetCatalogId}${ID_SEPARATOR_CHAR}${relation.targetSchemaName}${ID_SEPARATOR_CHAR}${relation.targetTableName}${ID_SEPARATOR_CHAR}${relation.targetColumnName}`,
      type: "smoothstep",
    };
  });

  const nodes = tables.map((table) => {
    const columns = (table.metadata.columns || []).map((column) => {
      return {
        id: `${table.metadata.projectId}${ID_SEPARATOR_CHAR}${table.metadata.catalogId}${ID_SEPARATOR_CHAR}${table.metadata.schemaName}${ID_SEPARATOR_CHAR}${table.metadata.tableName}${ID_SEPARATOR_CHAR}${column.columnName}`,
        name: column.columnName,
        isPrimary: column.isPrimary,
        isUnique: column.isUnique,
        isNullable: !column.isNotNull,
        dataType: column.dataType,
      };
    });

    const nodeId = `${table.metadata.projectId}${ID_SEPARATOR_CHAR}${table.metadata.catalogId}${ID_SEPARATOR_CHAR}${table.metadata.schemaName}${ID_SEPARATOR_CHAR}${table.metadata.tableName}`;

    return {
      id: nodeId,
      type: "table",
      data: {
        id: nodeId,
        name: table.metadata.tableName,
        onClick: onClick,
        hasRelations: edges.some(
          (edge) => edge.source === nodeId || edge.target === nodeId
        ),
        useWithAI: table.metadata.useWithAI,
        columns,
      } as TableNodeData,
      position: { x: 0, y: 0 },
    };
  });

  const nodesWithRelations = nodes
    .filter((node) => {
      return edges.some(
        (edge) => edge.source === node.id || edge.target === node.id
      );
    })
    .sort((node1, node2) => node1.data.name.localeCompare(node2.data.name));

  getLayoutedElementsViaDagre(nodesWithRelations, edges);

  let maxX = 0;
  nodesWithRelations.forEach((node) => {
    if (node.position.x > maxX) {
      maxX = node.position.x;
    }
  });

  const nodesWithoutRelations = nodes
    .filter((node) => !nodesWithRelations.includes(node))
    .sort((node1, node2) => node1.data.name.localeCompare(node2.data.name));

  getLayoutedElementsViaGrid(nodesWithoutRelations, edges, maxX);

  return { nodes: [...nodesWithRelations, ...nodesWithoutRelations], edges };
}

export const getLayoutedElementsViaGrid = (
  nodes: Node<TableNodeData>[],
  edges: Edge[],
  maxX: number
) => {
  const nodesPerRow = Math.ceil(Math.sqrt(nodes.length));
  const spacing = NODE_SEP;

  nodes.forEach((node, index) => {
    const row = Math.floor(index / nodesPerRow);
    const col = index % nodesPerRow;

    node.targetPosition = Position.Left;
    node.sourcePosition = Position.Right;
    node.position = {
      x: maxX + TABLE_NODE_WIDTH + col * TABLE_NODE_WIDTH,
      y: row * (TABLE_NODE_ROW_HEIGHT * 4 + spacing),
    };
  });

  return { nodes, edges };
};

export const getLayoutedElementsViaDagre = (
  nodes: Node<TableNodeData>[],
  edges: Edge[]
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: "LR",
    align: "UR",
    nodesep: NODE_SEP,
    ranksep: RANK_SEP,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {
      width: TABLE_NODE_WIDTH / 2,
      height: (TABLE_NODE_ROW_HEIGHT / 2) * (node.data.columns.length + 1),
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Left;
    node.sourcePosition = Position.Right;
    node.position = {
      x: nodeWithPosition.x - nodeWithPosition.width / 2,
      y: nodeWithPosition.y - nodeWithPosition.height / 2,
    };

    return node;
  });

  return { nodes, edges };
};
