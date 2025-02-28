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
  const [selectedNodeData, setSelectedNodeData] = useState<Node | null>(null);
  const fgRef = useRef();

  useEffect(() => {
    // Load the JSON data
    fetch('./output.json')
      .then(res => res.json())
      .then(jsonData => {
        setData(jsonData);
      })
      .catch(err => console.error('Error loading the graph data:', err));
  }, []);

  if (!data) return <div className="loading">Loading data...</div>;

  return (
    <div className="App">
 <ForceGraph3D
          ref={fgRef}
          graphData={data}
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
