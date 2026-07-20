import { useEffect, useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge
} from '@xyflow/react';
import type { Connection, Edge, Node as ReactFlowNode } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { api } from '../services/api';
import { NodePanel } from '../components/NodePanel';

interface BackendNode {
  id: string;
  name: string;
  category: string;
  positionX: number;
  positionY: number;
  metadata: Record<string, any>;
}

interface BackendEdge {
  id: string;
  sourceId: string;
  targetId: string;
}

export function CanvasPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState<ReactFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<ReactFlowNode | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [nodesRes, edgesRes] = await Promise.all([
          api.get<BackendNode[]>('/nodes'),
          api.get<BackendEdge[]>('/edges')
        ]);
        
        const mappedNodes: ReactFlowNode[] = nodesRes.data.map(node => ({
          id: node.id,
          position: { x: node.positionX, y: node.positionY },
          data: { label: node.name, category: node.category, ...node.metadata },
          type: 'default',
        }));

        const mappedEdges: Edge[] = edgesRes.data.map(edge => ({
          id: edge.id,
          source: edge.sourceId,
          target: edge.targetId,
        }));

        setNodes(mappedNodes);
        setEdges(mappedEdges);
      } catch (error) {
        console.error('Erro ao carregar os dados:', error);
      }
    }

    fetchData();
  }, [setNodes, setEdges]);

  // CREATE Edge
  const onConnect = useCallback(async (params: Connection | Edge) => {
    try {
      if (!params.source || !params.target) return;
      
      const payload = { sourceId: params.source, targetId: params.target };
      const res = await api.post<BackendEdge>('/edges', payload);
      
      const newEdge: Edge = {
        id: res.data.id,
        source: res.data.sourceId,
        target: res.data.targetId
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
    } catch (error) {
      console.error("Erro ao guardar conexão:", error);
    }
  }, [setEdges]);

  // DELETE Nodes via Keyboard
  const onNodesDelete = useCallback(async (deleted: ReactFlowNode[]) => {
    try {
      for (const node of deleted) {
        await api.delete(`/nodes/${node.id}`);
      }
    } catch (error) {
      console.error("Erro ao apagar o(s) nó(s):", error);
    }
  }, []);

  // DELETE Edges via Keyboard
  const onEdgesDelete = useCallback(async (deleted: Edge[]) => {
    try {
      for (const edge of deleted) {
        await api.delete(`/edges/${edge.id}`);
      }
    } catch (error) {
      console.error("Erro ao apagar a(s) conexão(ões):", error);
    }
  }, []);

  // UPDATE Node Position via Drag
  const onNodeDragStop = useCallback(async (_event: React.MouseEvent, node: ReactFlowNode) => {
    try {
      await api.put(`/nodes/${node.id}`, {
        positionX: node.position.x,
        positionY: node.position.y
      });
    } catch (error) {
      console.error("Erro ao guardar nova posição:", error);
    }
  }, []);

  // Selecionar Nó
  const onNodeClick = useCallback((_event: React.MouseEvent, node: ReactFlowNode) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // UPDATE Node metadata via Panel
  const handleNodeUpdated = (updatedBackendNode: BackendNode) => {
    setNodes(nds => nds.map(node => {
      if (node.id === updatedBackendNode.id) {
        return {
          ...node,
          data: { label: updatedBackendNode.name, category: updatedBackendNode.category, ...updatedBackendNode.metadata }
        };
      }
      return node;
    }));
  };

  // DELETE Node via Panel
  const handleNodeDeleted = (id: string) => {
    setNodes(nds => nds.filter(node => node.id !== id));
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
  };

  // CREATE Node via Button
  const handleAddNode = async () => {
    try {
      const payload = {
        name: 'Novo Item',
        category: 'infra',
        positionX: Math.random() * 300 + 50,
        positionY: Math.random() * 300 + 50,
        metadata: { status: "pendente" }
      };
      const res = await api.post<BackendNode>('/nodes', payload);
      const newNode: ReactFlowNode = {
        id: res.data.id,
        position: { x: res.data.positionX, y: res.data.positionY },
        data: { label: res.data.name, category: res.data.category, ...res.data.metadata },
        type: 'default',
      };
      setNodes(nds => [...nds, newNode]);
    } catch (error) {
      console.error("Erro ao criar nó:", error);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      
      {/* Botão de Adicionar */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 5 }}>
        <button 
          onClick={handleAddNode}
          style={{
            padding: '12px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
          + Adicionar Nó
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onNodeDragStop={onNodeDragStop}
      >
        <Controls />
        <Background />
      </ReactFlow>

      <NodePanel 
        selectedNode={selectedNode} 
        onClose={() => setSelectedNode(null)} 
        onNodeUpdated={handleNodeUpdated}
        onNodeDeleted={handleNodeDeleted}
      />
    </div>
  );
}
