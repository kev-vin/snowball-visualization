import { Group, Stage, Rect, Text } from "react-konva";
import Konva from "konva";

const NodeInfoBox = (props) => {
  const [x, y, state] = Object.values(props.nodeInfoBoxData);
  return (
    <Group x={x} y={y}>
      <Rect width={100} height={110} stroke={"black"} fill={"darkgrey"} />
      <Text y={5} x={5} text={`id: ${state.id}`} />
      <Text y={20} x={5} text={`color: ${state.color}`} />
      <Text y={35} x={5} text={`count: ${state.count}`} />
      <Text y={50} x={5} text={`failed: ${state.failed}`} />
      <Text y={65} x={5} text={`accepted: ${state.accepted}`} />
      <Text y={80} x={5} text={`conf r: ${state.colorConfidence.RED}`} />
      <Text y={95} x={5} text={`conf b: ${state.colorConfidence.BLUE}`} />
    </Group>
  );
};

export default NodeInfoBox;
