import { useState, useEffect } from 'react';
import type { Node } from '@xyflow/react';
import { api } from '../services/api';

interface NodePanelProps {
  selectedNode: Node | null;
  onClose: () => void;
  onNodeUpdated: (updatedNode: any) => void;
  onNodeDeleted: (id: string) => void;
}

export function NodePanel({ selectedNode, onClose, onNodeUpdated, onNodeDeleted }: NodePanelProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedNode) {
      const { label, category, ...meta } = selectedNode.data as Record<string, any>;
      setFormData({
        name: label,
        category: category || 'infra',
        ...meta
      });
    }
  }, [selectedNode]);

  if (!selectedNode) return null;

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { name, category, ...metadata } = formData;
      
      const updatePayload: any = {};
      if (name) updatePayload.name = name;
      if (category) updatePayload.category = category;
      updatePayload.metadata = metadata;

      const response = await api.put(`/nodes/${selectedNode.id}`, updatePayload);
      
      onNodeUpdated(response.data);
      onClose();
    } catch (error) {
      console.error("Erro ao guardar o nó:", error);
      alert("Erro ao guardar o nó!");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem a certeza que deseja apagar este nó? (Esta ação também apagará as suas ligações)")) return;
    setIsSaving(true);
    try {
      await api.delete(`/nodes/${selectedNode.id}`);
      onNodeDeleted(selectedNode.id);
      onClose();
    } catch (error) {
      console.error("Erro ao apagar nó:", error);
      alert("Erro ao apagar nó!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      right: 0,
      top: 0,
      width: '320px',
      height: '100%',
      backgroundColor: '#f8f9fa',
      borderLeft: '1px solid #ddd',
      boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
      padding: '20px',
      boxSizing: 'border-box',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#333' }}>Propriedades</h2>
        <button onClick={onClose} style={{ cursor: 'pointer', border: 'none', background: 'transparent', fontSize: '16px' }}>❌</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {Object.entries(formData).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px', textTransform: 'capitalize', color: '#555' }}>
              {key}
            </label>
            <input 
              type={typeof value === 'number' ? 'number' : 'text'}
              value={value}
              onChange={(e) => handleChange(key, typeof value === 'number' ? Number(e.target.value) : e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                boxSizing: 'border-box',
                fontSize: '14px'
              }}
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button 
          onClick={handleDelete} 
          disabled={isSaving}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            opacity: isSaving ? 0.7 : 1
          }}
        >
          Apagar
        </button>
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          style={{
            flex: 2,
            padding: '12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
            opacity: isSaving ? 0.7 : 1
          }}
        >
          {isSaving ? 'A guardar...' : 'Guardar'}
        </button>
      </div>
    </div>
  );
}
