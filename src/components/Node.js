import { Stage, Rect } from "react-konva";
import Konva from "konva";

const cellSize = 50;
const margin = 5;

const colorMap = {
  FAILED: "black",
  RED: "red",
  BLUE: "blue",
  NOCOLOR: "grey",
};

const Node = (props) => {
  const { state, x, y } = props;
  return (
    <Rect
      x={x}
      y={y}
      width={cellSize - margin}
      height={cellSize - margin}
      fill={colorMap[state.failed ? "FAILED" : state.color]}
    />
  );
};

export { cellSize, Node };
