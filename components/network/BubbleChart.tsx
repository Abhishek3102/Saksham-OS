"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";

interface Node extends d3.SimulationNodeDatum {
  id: string;
  type: "company" | "freelancer";
  name: string;
  value: number; // credibility or hiring volume
  img?: string;
  // Additional data for tooltip
  experience?: string;
  credibility?: number;
  budget?: string;
  projects?: number;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  weight: number;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

interface BubbleChartProps {
  data: GraphData;
  onNodeClick: (node: Node) => void;
  width?: number;
  height?: number;
}

const BubbleChart: React.FC<BubbleChartProps> = ({
  data,
  onNodeClick,
  width = 800,
  height = 600,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: Node | null;
  }>({ visible: false, x: 0, y: 0, content: null });

  useEffect(() => {
    if (!data || !data.nodes || data.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom as any);

    const g = svg.append("g");

    // Color gradients
    // Define arrow markers
    const defs = svg.append("defs");
    
    defs.append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20) // Position of arrow relative to node center (will need adjustment based on radius)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#999")
      .style("opacity", 0.6);

    // Color gradients
    // Freelancer Gradient (Blue -> Cyan)
    const freelancerGradient = defs
      .append("linearGradient")
      .attr("id", "grad-freelancer")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
    freelancerGradient
      .append("stop")
      .attr("offset", "0%")
      .style("stop-color", "#60a5fa"); // blue-400
    freelancerGradient
      .append("stop")
      .attr("offset", "100%")
      .style("stop-color", "#22d3ee"); // cyan-400

    // Company Gradient (Purple -> Violet)
    const companyGradient = defs
      .append("linearGradient")
      .attr("id", "grad-company")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "100%");
    companyGradient
      .append("stop")
      .attr("offset", "0%")
      .style("stop-color", "#a855f7"); // purple-500
    companyGradient
      .append("stop")
      .attr("offset", "100%")
      .style("stop-color", "#7c3aed"); // violet-600

    // Simulation setup
    // Filter links to ensure source and target exist in nodes
    const nodeIds = new Set(data.nodes.map((n) => n.id));
    const validLinks = data.links.filter(
      (l) =>
        nodeIds.has(typeof l.source === "object" ? (l.source as Node).id : (l.source as string)) &&
        nodeIds.has(typeof l.target === "object" ? (l.target as Node).id : (l.target as string))
    );

    const simulation = d3
      .forceSimulation<Node>(data.nodes)
      .force(
        "link",
        d3
          .forceLink<Node, Link>(validLinks)
          .id((d) => d.id)
          .distance((d) => 150 + (100 / (d.weight || 1))) // Increased distance
      )
      .force("charge", d3.forceManyBody().strength(-800)) // Stronger repulsion
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius((d: any) => (d.value || 20) + 15).iterations(2));

    // Draw Links
    const link = g
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.4)
      .selectAll("line")
      .data(validLinks)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.weight || 1) * 1.5)
      .attr("marker-end", "url(#arrowhead)") // Add arrow marker
      .attr("class", "transition-all duration-300");

    // Draw Nodes
    const node = g
      .append("g")
      .selectAll("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", (d) => Math.max(d.value ? Math.sqrt(d.value) * 0.05 : 15, 15)) // Better sizing logic based on revenue/value
      .attr("fill", (d) =>
        d.type === "company" ? "url(#grad-company)" : "url(#grad-freelancer)"
      )
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("cursor", "pointer")
      .call(
        d3
          .drag<SVGCircleElement, Node>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended) as any
      )
      .on("click", (event, d) => {
        onNodeClick(d);
        event.stopPropagation();
      })
      .on("mouseover", (event, d) => {
        const radius = Math.max(d.value ? Math.sqrt(d.value) * 0.05 : 15, 15);
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("r", radius * 1.3)
          .attr("filter", "drop-shadow(0 0 12px rgba(255,255,255,0.6))");

        // Highlight connected links
        link
          .style("stroke", (l) =>
            l.source === d || l.target === d ? "#fff" : "#999"
          )
          .style("stroke-opacity", (l) =>
            l.source === d || l.target === d ? 1 : 0.1
          )
          .style("stroke-width", (l) => 
            l.source === d || l.target === d ? Math.sqrt(l.weight || 1) * 3 : Math.sqrt(l.weight || 1) * 1.5
          );

        setTooltip({
          visible: true,
          x: event.pageX,
          y: event.pageY,
          content: d,
        });
      })
      .on("mouseout", (event, d) => {
        const radius = Math.max(d.value ? Math.sqrt(d.value) * 0.05 : 15, 15);
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr("r", radius)
          .attr("filter", null);

        link
            .style("stroke", "#999")
            .style("stroke-opacity", 0.4)
            .style("stroke-width", (d) => Math.sqrt(d.weight || 1) * 1.5);

        setTooltip((prev) => ({ ...prev, visible: false }));
      });

    // Node Labels
    const labels = g
      .append("g")
      .selectAll("text")
      .data(data.nodes)
      .join("text")
      .text((d) => d.name.length > 15 ? d.name.substring(0, 12) + "..." : d.name)
      .attr("font-size", "11px")
      .attr("font-weight", "500")
      .attr("fill", "#e5e7eb") // gray-200
      .attr("text-anchor", "middle")
      .attr("dy", (d) => Math.max(d.value ? Math.sqrt(d.value) * 0.05 : 15, 15) + 15)
      .style("pointer-events", "none")
      .style("opacity", 0.9)
      .style("text-shadow", "0 1px 2px rgba(0,0,0,0.8)");

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as Node).x!)
        .attr("y1", (d) => (d.source as Node).y!)
        .attr("x2", (d) => (d.target as Node).x!)
        .attr("y2", (d) => (d.target as Node).y!);

      node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);

      labels.attr("x", (d) => d.x!).attr("y", (d) => d.y!);
    });

    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGCircleElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data, width, height, onNodeClick]);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden rounded-xl border border-slate-800 shadow-2xl">
      <svg ref={svgRef} width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="cursor-move" />
      
      <AnimatePresence>
        {tooltip.visible && tooltip.content && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            style={{
              position: "fixed",
              left: tooltip.x + 15,
              top: tooltip.y + 15,
              pointerEvents: "none",
            }}
            className="z-50 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-lg shadow-xl min-w-[200px]"
          >
            <h3 className="text-lg font-bold text-white mb-1">
              {tooltip.content.name}
            </h3>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
              {tooltip.content.type}
            </p>
            <div className="space-y-1 text-sm text-slate-300">
              {tooltip.content.type === "freelancer" ? (
                <>
                  <div className="flex justify-between">
                    <span>Credibility:</span>
                    <span className="text-cyan-400 font-mono">
                      {tooltip.content.credibility}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Experience:</span>
                    <span>{tooltip.content.experience}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>Hiring Vol:</span>
                    <span className="text-purple-400 font-mono">
                      {tooltip.content.value}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Budget:</span>
                    <span>{tooltip.content.budget}</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BubbleChart;
