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
          nodeAutoColorBy="type"
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.25}
          nodeRelSize={6}
        />
    </div>
  );
}

export default App;
