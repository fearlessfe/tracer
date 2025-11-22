import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface GraphNode {
  id: string;
  label: string;
  type: 'req' | 'tc' | 'arch' | 'dd' | 'root';
  x?: number;
  y?: number;
  description?: string;
}

interface GraphEdge {
  source: string;
  target: string;
}

interface TraceabilityGraphProps {
  data: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  mode: 'network' | 'tree';
  activeTypes?: string[];
  searchQuery?: string;
}

export const TraceabilityGraph: React.FC<TraceabilityGraphProps> = ({ 
  data, 
  mode, 
  activeTypes = ['req', 'tc', 'arch', 'dd'],
  searchQuery = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'req': return '#3b82f6'; // blue
      case 'tc': return '#10b981'; // green
      case 'arch': return '#8b5cf6'; // purple
      case 'dd': return '#f97316'; // orange
      case 'root': return '#64748b'; // slate for virtual root
      default: return '#cbd5e1';
    }
  };

  useEffect(() => {
    if (!data.nodes.length || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Clear previous render
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const tooltip = d3.select(tooltipRef.current);

    // Tooltip Helpers
    const showTooltip = (event: any, d: any) => {
      const data = d.data || d; // Tree uses d.data, Network uses d directly
      if (data.type === 'root') return;

      const desc = data.description || `暂无关于 ${data.label} 的详细描述信息。`;
      
      tooltip.transition().duration(200).style("opacity", 1);
      tooltip.html(`
        <div class="font-bold text-xs mb-1 text-slate-200">${data.label}</div>
        <div class="text-xs text-slate-400 leading-relaxed">${desc}</div>
      `);
    };

    const moveTooltip = (event: any) => {
       // Position relative to the container using d3.pointer
       const [x, y] = d3.pointer(event, containerRef.current);
       tooltip.style("left", `${x + 15}px`)
              .style("top", `${y + 15}px`);
    };

    const hideTooltip = () => {
       tooltip.transition().duration(200).style("opacity", 0);
    };

    // 1. Filter Data based on Active Types
    const filteredNodes = data.nodes.filter(n => activeTypes.includes(n.type));
    const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredEdges = data.edges.filter(e => 
      filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
    );

    // 2. Prepare Search Logic
    const isMatch = (node: GraphNode) => {
      if (!searchQuery) return false;
      return node.label.toLowerCase().includes(searchQuery.toLowerCase());
    };

    // Add Zoom behavior
    const g = svg.append("g");
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);
    // Center initial view (simplified)
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(mode === 'tree' ? 0.9 : 0.6));

    if (mode === 'network') {
      renderNetwork(g, filteredNodes, filteredEdges);
    } else {
      renderTree(g, filteredNodes, filteredEdges);
    }

    function renderNetwork(
      container: d3.Selection<SVGGElement, unknown, null, undefined>, 
      nodesData: GraphNode[], 
      linksData: GraphEdge[]
    ) {
      // Create a copy for simulation
      const nodes = nodesData.map(d => ({ ...d }));
      const links = linksData.map(d => ({ source: d.source, target: d.target }));

      const simulation = d3.forceSimulation(nodes as any)
        .force("link", d3.forceLink(links).id((d: any) => d.id).distance(80))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(0, 0))
        .force("collide", d3.forceCollide().radius(25));

      const link = container.append("g")
        .attr("stroke", "#cbd5e1")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", 1.5);

      const nodeGroup = container.append("g")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .call(d3.drag<any, any>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }));

      // Node Circle
      nodeGroup.append("circle")
        .attr("r", d => isMatch(d) ? 12 : 8) // Highlight size
        .attr("fill", d => getNodeColor(d.type))
        .attr("stroke", d => isMatch(d) ? "#f43f5e" : "#fff") // Highlight color (Red vs White)
        .attr("stroke-width", d => isMatch(d) ? 3 : 2)
        .attr("opacity", d => searchQuery && !isMatch(d) ? 0.3 : 1) // Dim non-matches
        .on("mouseover", showTooltip)
        .on("mousemove", moveTooltip)
        .on("mouseout", hideTooltip);

      // Node Label
      nodeGroup.append("text")
        .text(d => d.label)
        .attr("x", 14)
        .attr("y", 4)
        .attr("font-family", "Inter, sans-serif")
        .attr("font-size", d => isMatch(d) ? "14px" : "10px")
        .attr("font-weight", d => isMatch(d) ? "bold" : "normal")
        .attr("fill", d => isMatch(d) ? "#0f172a" : "#64748b")
        .attr("opacity", d => searchQuery && !isMatch(d) ? 0.3 : 1)
        .style("pointer-events", "none"); // Prevent label from blocking tooltip triggers on circle

      // Simulation Tick
      simulation.on("tick", () => {
        link
          .attr("x1", (d: any) => d.source.x)
          .attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x)
          .attr("y2", (d: any) => d.target.y);

        nodeGroup
          .attr("transform", (d: any) => `translate(${d.x},${d.y})`);
      });
    }

    function renderTree(
      container: d3.Selection<SVGGElement, unknown, null, undefined>,
      nodesData: GraphNode[],
      linksData: GraphEdge[]
    ) {
      // Helper to safely get a node copy if it exists in filtered set
      const getNode = (id: string) => {
         const original = nodesData.find(n => n.id === id);
         return original ? { ...original, children: [] } : null;
      };

      // Build Hierarchy
      // Root -> REQ -> TC / ARCH -> DD
      const rootNode = { id: 'Project Root', label: 'Project', type: 'root', children: [] as any[] };
      
      // 1. Add REQs
      const reqNodes = nodesData.filter(n => n.type === 'req');
      
      reqNodes.forEach(req => {
        const node = getNode(req.id);
        if (!node) return;
        
        rootNode.children.push(node);

        // 2. Find children (Edges from REQ)
        const childEdges = linksData.filter(e => e.source === req.id);
        childEdges.forEach(edge => {
           const childNode = getNode(edge.target);
           if (!childNode) return; // Skip if type is filtered out
           
           node.children.push(childNode);
           
           // 3. If child is ARCH, find DD
           if (childNode.type === 'arch') {
              const archEdges = linksData.filter(ae => ae.source === childNode.id);
              archEdges.forEach(ae => {
                 const ddNode = getNode(ae.target);
                 if (ddNode) childNode.children.push(ddNode);
              });
           }
        });
      });

      // If we filtered everything out, just show root
      const hierarchy = d3.hierarchy(rootNode);
      
      // Tree Layout
      const treeLayout = d3.tree().nodeSize([35, 140]);
      const root = treeLayout(hierarchy);

      // Render Links
      container.append("g")
        .attr("fill", "none")
        .attr("stroke", "#e2e8f0")
        .attr("stroke-width", 1.5)
        .selectAll("path")
        .data(root.links())
        .join("path")
        .attr("d", d3.linkHorizontal()
          .x((d: any) => d.y)
          .y((d: any) => d.x) as any
        );

      // Render Nodes
      const node = container.append("g")
        .selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("transform", (d: any) => `translate(${d.y},${d.x})`);

      node.append("circle")
        .attr("r", d => (d.data as any).type === 'root' ? 6 : isMatch(d.data as any) ? 8 : 5)
        .attr("fill", (d: any) => (d.children || (d.data as any).type === 'root') ? "#fff" : getNodeColor((d.data as any).type))
        .attr("stroke", (d: any) => isMatch(d.data as any) ? "#f43f5e" : getNodeColor((d.data as any).type))
        .attr("stroke-width", d => isMatch(d.data as any) ? 3 : 2)
        .attr("opacity", d => (d.data as any).type !== 'root' && searchQuery && !isMatch(d.data as any) ? 0.3 : 1)
        .on("mouseover", showTooltip)
        .on("mousemove", moveTooltip)
        .on("mouseout", hideTooltip);

      node.append("text")
        .attr("dy", "0.31em")
        .attr("x", (d: any) => d.children ? -10 : 10)
        .attr("text-anchor", (d: any) => d.children ? "end" : "start")
        .text((d: any) => (d.data as any).label)
        .attr("font-size", d => isMatch(d.data as any) ? "12px" : "10px")
        .attr("font-weight", d => isMatch(d.data as any) ? "bold" : "normal")
        .attr("fill", d => isMatch(d.data as any) ? "#0f172a" : "#475569")
        .attr("opacity", d => (d.data as any).type !== 'root' && searchQuery && !isMatch(d.data as any) ? 0.3 : 1)
        .clone(true).lower()
        .attr("stroke", "white")
        .attr("stroke-width", 3)
        .style("pointer-events", "none");

      // Shift slightly left
      container.attr("transform", `translate(80, ${height/2})`);
    }

  }, [data, mode, activeTypes, searchQuery]);

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-50/50 overflow-hidden cursor-move touch-none relative">
      <svg ref={svgRef} width="100%" height="100%"></svg>
      <div 
        ref={tooltipRef} 
        className="absolute pointer-events-none bg-slate-800/90 backdrop-blur-sm text-white p-3 rounded-lg shadow-xl z-50 max-w-[240px] border border-slate-700/50"
        style={{ opacity: 0, top: 0, left: 0, transition: 'opacity 0.2s ease' }}
      >
      </div>
    </div>
  );
};