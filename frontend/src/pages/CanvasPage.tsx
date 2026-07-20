import { useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node as ReactFlowNode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { api } from '../services/api';

interface BackendNode {
  id: string;
  name: string;
  category: string;
  positionX: number;
  positionY: number;
  metadata: Record<string, any>;
}

export function CanvasPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<ReactFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    async function fetchNodes() {
      try {
        const response = await api.get<BackendNode[]>('/nodes');
        
        // Mapeamento correto: Backend -> ReactFlow
        const mappedNodes: ReactFlowNode[] = response.data.map(node => ({
          id: node.id,
          position: { x: node.positionX, y: node.positionY },
          data: { label: node.name, ...node.metadata }, // metadata já vem como JSON.parse do backend
          type: 'default',
        }));

        setNodes(mappedNodes);
      } catch (error) {
        console.error('Erro ao carregar os nós:', error);
      }
    }

    fetchNodes();
  }, [setNodes]);

  const onConnect = (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds));

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
