import { Stage, Layer } from "react-konva";
import { cellSize, Node } from "./Node";
import NodeInfoBox from "./NodeInfoBox";
import { useState } from "react";

const canvasWidth = 500;
const tooltipPadding = 110; //extra room to render tooltip off screen

const Grid = (props) => {
  const { nodes } = props;
  const nodesPerRow = Math.floor(canvasWidth / cellSize);
  const rowCount = Math.ceil(nodes.length / nodesPerRow);
  const canvasHeight = rowCount * cellSize;

  const [nodeInfoBoxVisible, setNodeInfoBoxVisible] = useState(false);
  const [nodeInfoBoxData, setNodeInfoBoxData] = useState({
    x: 0,
    y: 0,
    state: {},
  });
  const showNodeInfoBox = (x, y, state) => {
    setNodeInfoBoxData({ x: x, y: y, state: state });
    setNodeInfoBoxVisible(true);
  };

  return (
    <Stage
      width={canvasWidth + tooltipPadding}
      height={canvasHeight + tooltipPadding}
      onMouseLeave={() => setNodeInfoBoxVisible(false)}
    >
      <Layer>
        {nodes.map((node, i) => {
          const x = (i % nodesPerRow) * cellSize + tooltipPadding / 2;
          const y = Math.floor(i / nodesPerRow) * cellSize + tooltipPadding / 2;
          return (
            <Node
              key={i}
              state={node}
              x={x}
              y={y}
              mouseOver={showNodeInfoBox}
            />
          );
        })}
        {nodeInfoBoxVisible && (
          <NodeInfoBox nodeInfoBoxData={nodeInfoBoxData} />
        )}
      </Layer>
      <Layer>
        {nodeInfoBoxVisible && (
          <NodeInfoBox nodeInfoBoxData={nodeInfoBoxData} />
        )}
      </Layer>
    </Stage>
  );
};

export default Grid;
