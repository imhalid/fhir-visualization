import React, { useEffect, useState, useRef } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import './App.css';

interface Node {
  id: string;
  type: string;
  description: string;
}

interface Link {
  source: string;
  target: string;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

function App() {
  const [data, setData] = useState<GraphData | null>(null);
  const [filteredData, setFilteredData] = useState<GraphData | null>(null);
  const [selectedNodeData, setSelectedNodeData] = useState<Node | null>(null);
  const [filterText, setFilterText] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('type'); // 'type', 'id', or 'description'
  const fgRef = useRef<any>(null);

  useEffect(() => {
    // Load the JSON data
    fetch('./public/output.json')
      .then(res => res.json())
      .then(jsonData => {
        setData(jsonData);
        setFilteredData(jsonData); // Initialize filtered data with all data
      })
      .catch(err => console.error('Error loading the graph data:', err));
  }, []);

  useEffect(() => {
    if (!data) return;
    
    // Apply filtering when filterText or filterType changes
    applyFilter();
  }, [filterText, filterType, data]);

  const applyFilter = () => {
    if (!data) return;
    
    if (!filterText.trim()) {
      // If filter is empty, show all data
      setFilteredData(data);
      return;
    }
    
    // Filter nodes based on the selected filter type and text
    const searchTerm = filterText.toLowerCase();
    let filteredNodes: Node[] = [];
    
    if (filterType === 'type') {
      // For type filtering, only look at the part before the underscore
      filteredNodes = data.nodes.filter(node => {
        const typeParts = node.type.split('_');
        return typeParts[0].toLowerCase().includes(searchTerm);
      });
      
      // Get the IDs of directly matched nodes
      const directMatchNodeIds = new Set(filteredNodes.map(node => node.id));
      
      // Find related nodes (nodes connected to the filtered nodes)
      const relatedNodeIds = new Set<string>();
      
      data.links.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source : link.source;
        const targetId = typeof link.target === 'object' ? link.target : link.target;
        
        // If either source or target is in the filtered set, add both to related set
        if (directMatchNodeIds.has(sourceId)) {
          relatedNodeIds.add(targetId);
        }
        if (directMatchNodeIds.has(targetId)) {
          relatedNodeIds.add(sourceId);
        }
      });
      
      // Add related nodes to the filtered nodes
      data.nodes.forEach(node => {
        if (relatedNodeIds.has(node.id) && !directMatchNodeIds.has(node.id)) {
          filteredNodes.push(node);
        }
      });
    } else {
      // For other filter types, use the previous filtering logic
      filteredNodes = data.nodes.filter(node => {
        switch (filterType) {
          case 'id':
            return node.id.toLowerCase().includes(searchTerm);
          case 'description':
            return node.description.toLowerCase().includes(searchTerm);
          default:
            return true;
        }
      });
    }

    // Get the ids of filtered nodes
    const filteredNodeIds = new Set(filteredNodes.map(node => node.id));
    
    // Filter links to only include connections between filtered nodes
    const filteredLinks = data.links.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source : link.source;
      const targetId = typeof link.target === 'object' ? link.target : link.target;
      return filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId);
    });
    
    setFilteredData({ nodes: filteredNodes, links: filteredLinks });
  };

  if (!filteredData) return <div className="loading">Loading data...</div>;

  return (
    <div className="App">
      <div className="filter-container" style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        zIndex: 1, 
        padding: '10px',
        background: 'rgba(255, 255, 255, 0.8)',
        borderRadius: '5px'
      }}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="filter-type">Filter by: </label>
          <select 
            id="filter-type"
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            style={{ marginLeft: '5px' }}
          >
            <option value="type">Type</option>
            <option value="id">ID</option>
            <option value="description">Description</option>
          </select>
        </div>
        <input
          type="text"
          placeholder={`Filter by ${filterType}...`}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{ width: '100%', padding: '5px' }}
        />
        {data && filteredData && (
          <div style={{ marginTop: '5px', fontSize: '0.8em' }}>
            Showing {filteredData.nodes.length} of {data.nodes.length} nodes
          </div>
        )}
      </div>
      
      <ForceGraph3D
        ref={fgRef}
        graphData={filteredData}
        nodeLabel={(node: Node) => `${node.type}\n\n${node.description}`}
        nodeAutoColorBy="id"
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        onNodeDragEnd={node => {
          node.fx = node.x;
          node.fy = node.y;
          node.fz = node.z;
        }}
        nodeRelSize={5}
        nodeOpacity={1}
        onNodeClick={(node) => {
          console.log(node);
          setSelectedNodeData(node);
        }}
      /> 
      
      {selectedNodeData && (
        <div className="absolute bottom-0 left-0 p-4 bg-white bg-opacity-50 text-left">
          <h1>{selectedNodeData.id}</h1>
          <h2>{selectedNodeData.type}</h2>
          <p>{selectedNodeData.description}</p>
        </div>
      )}
    </div>
  );
}

export default App;
