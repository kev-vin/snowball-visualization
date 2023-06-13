import { Stage, Layer } from "react-konva";
import { cellSize, Node } from "./Node";
const canvasWidth = 500;

const Grid = (props) => {
  const { nodes } = props;
  const nodesPerRow = Math.floor(canvasWidth / cellSize);
  const rowCount = Math.ceil(nodes.length / nodesPerRow);
  const canvasHeight = rowCount * cellSize;
  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        {nodes.map((node, i) => {
          const x = (i % nodesPerRow) * cellSize;
          const y = Math.floor(i / nodesPerRow) * cellSize;
          return <Node key={i} state={node} x={x} y={y} />;
        })}
      </Layer>
    </Stage>
  );
};

export default Grid;
