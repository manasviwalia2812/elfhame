import React, { useMemo, useEffect, useState } from 'react';
import './FamilyTree.css';
import audioSynth from '../utils/audio';

function layoutTree(people) {
  const byId = {};
  people.forEach(p => byId[p.id] = { ...p, parents: p.parents || [] });

  const childrenOf = {};   // primary-parent id -> [childId,...]
  const roots = [];

  Object.values(byId).forEach(p => {
    if (p.parents.length === 0) {
      roots.push(p.id);
    } else {
      const primary = p.parents[0];
      (childrenOf[primary] = childrenOf[primary] || []).push(p.id);
    }
  });

  // depth via BFS from roots, following primary-parent edges
  const depth = {};
  const queue = [];
  roots.forEach(r => { depth[r] = 0; queue.push(r); });
  while (queue.length) {
    const id = queue.shift();
    (childrenOf[id] || []).forEach(c => {
      depth[c] = depth[id] + 1;
      queue.push(c);
    });
  }

  // assign horizontal leaf-slots via post-order traversal
  let leafCounter = 0;
  const slotX = {};
  function assign(id) {
    const kids = childrenOf[id] || [];
    if (kids.length === 0) {
      slotX[id] = leafCounter++;
      return slotX[id];
    }
    const xs = kids.map(assign);
    slotX[id] = (Math.min(...xs) + Math.max(...xs)) / 2;
    return slotX[id];
  }
  roots.forEach(assign);

  const maxDepth = Math.max(0, ...Object.values(depth));
  const totalSlots = Math.max(1, leafCounter);

  const marginX = 90, marginTop = 70, rowHeight = 150;
  const usableWidth = 1000 - marginX * 2;
  const colWidth = totalSlots > 1 ? usableWidth / (totalSlots - 1) : 0;

  const pos = {};
  Object.keys(byId).forEach(id => {
    const x = totalSlots > 1 ? marginX + slotX[id] * colWidth : 500;
    const y = marginTop + depth[id] * rowHeight;
    pos[id] = { x, y, depth: depth[id] };
  });

  const svgHeight = marginTop + maxDepth * rowHeight + 90;

  // edges: one per parent listed (primary + any secondary)
  const edges = [];
  Object.values(byId).forEach(p => {
    p.parents.forEach((parentId, i) => {
      if (pos[parentId]) edges.push({ from: parentId, to: p.id, secondary: i > 0 });
    });
  });
  // stagger delay by depth, then order
  edges.sort((a,b) => pos[a.to].depth - pos[b.to].depth);
  edges.forEach((e,i) => e.delay = pos[e.to].depth * 220 + (i % 8) * 40);

  const nodeOrder = Object.keys(byId).sort((a,b) => pos[a].depth - pos[b].depth);
  nodeOrder.forEach((id,i) => pos[id].delay = pos[id].depth * 220 + 80);

  return { byId, pos, edges, svgHeight };
}

function curvePath(p1, p2) {
  const midY = (p1.y + p2.y) / 2;
  return `M ${p1.x},${p1.y + 14} C ${p1.x},${midY} ${p2.x},${midY} ${p2.x},${p2.y - 18}`;
}

export default function FamilyTree({ treeData, onBack }) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    // Trigger animated slide-in/fade-in transitions
    setInView(false);
    const timer = setTimeout(() => {
      setInView(true);
    }, 150);
    return () => clearTimeout(timer);
  }, [treeData]);

  const { byId, pos, edges, svgHeight } = useMemo(() => {
    if (!treeData || !treeData.people) {
      return { byId: {}, pos: {}, edges: [], svgHeight: 400 };
    }
    return layoutTree(treeData.people);
  }, [treeData]);

  const handleBackClick = () => {
    audioSynth.playMarkerClick();
    onBack();
  };

  return (
    <div className="family-tree-modal-container">
      <div className={`family-tree-inner ${inView ? 'in-view' : ''}`}>
        {/* Return Button */}
        <button 
          className="family-tree-back-btn" 
          onClick={handleBackClick}
          onMouseEnter={() => audioSynth.playMarkerHover()}
        >
          ← Return to Card
        </button>

        {/* Border Ornaments */}
        <div className="family-tree-corner tl">
          <svg viewBox="0 0 46 46">
            <path d="M2 44 C2 20 20 2 44 2" fill="none" stroke="#9c7a32" strokeWidth="1.5"/>
            <circle cx="2" cy="44" r="2.5" fill="#9c7a32"/>
          </svg>
        </div>
        <div className="family-tree-corner tr">
          <svg viewBox="0 0 46 46">
            <path d="M2 44 C2 20 20 2 44 2" fill="none" stroke="#9c7a32" strokeWidth="1.5"/>
            <circle cx="2" cy="44" r="2.5" fill="#9c7a32"/>
          </svg>
        </div>
        <div className="family-tree-corner bl">
          <svg viewBox="0 0 46 46">
            <path d="M2 44 C2 20 20 2 44 2" fill="none" stroke="#9c7a32" strokeWidth="1.5"/>
            <circle cx="2" cy="44" r="2.5" fill="#9c7a32"/>
          </svg>
        </div>
        <div className="family-tree-corner br">
          <svg viewBox="0 0 46 46">
            <path d="M2 44 C2 20 20 2 44 2" fill="none" stroke="#9c7a32" strokeWidth="1.5"/>
            <circle cx="2" cy="44" r="2.5" fill="#9c7a32"/>
          </svg>
        </div>

        {/* Title */}
        <div className="family-tree-title-block">
          <svg className="crest" viewBox="0 0 60 60">
            <path d="M30 4 L54 16 V34 C54 48 42 56 30 58 C18 56 6 48 6 34 V16 Z" fill="none" stroke="#5c1f1f" strokeWidth="2"/>
            <circle cx="30" cy="28" r="6" fill="#5c1f1f"/>
          </svg>
          <h1>{treeData?.title || 'Family Lineage'}</h1>
          <div className="sub">{treeData?.subtitle || 'A Lineage'}</div>
        </div>
        <div className="family-tree-rule"></div>

        {/* SVG Drawing Canvas & HTML Node overlays */}
        <div className="family-tree-wrap">
          <svg className="family-tree-svg" viewBox={`0 0 1000 ${svgHeight}`} preserveAspectRatio="xMidYMin meet">
            {edges.map((e, index) => {
              const fromPos = pos[e.from];
              const toPos = pos[e.to];
              if (!fromPos || !toPos) return null;
              return (
                <path
                  key={`${e.from}-${e.to}-${index}`}
                  className="family-tree-branch"
                  d={curvePath(fromPos, toPos)}
                  pathLength="1"
                  style={{ '--d': `${e.delay}ms` }}
                />
              );
            })}
          </svg>
          
          <div id="nodeLayer">
            {Object.values(byId).map((p) => {
              const nodePos = pos[p.id];
              if (!nodePos) return null;
              const { x, y, delay } = nodePos;
              return (
                <div
                  key={p.id}
                  className={`family-tree-node ${p.crown ? 'crown' : 'minor'}`}
                  style={{
                    left: `${(x / 1000) * 100}%`,
                    top: `${(y / svgHeight) * 100}%`,
                    '--d': `${delay}ms`
                  }}
                >
                  <div className="family-tree-node-box">
                    <div className="name">{p.name}</div>
                    {p.role && <div className="role">{p.role}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
