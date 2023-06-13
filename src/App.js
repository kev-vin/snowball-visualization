import { useState, useEffect, useRef } from "react";
import Grid from "./components/Grid";
import {
  Heading,
  Center,
  VStack,
  FormControl,
  FormHelperText,
  Flex,
  FormLabel,
  Slider,
  SliderTrack,
  SliderThumb,
  SliderFilledTrack,
  Button,
  Link,
} from "@chakra-ui/react";

const App = () => {
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [nodeCount, setNodeCount] = useState(100);
  const [probStartWithColor, setProbStartWithColor] = useState(0.2); // probability that a node starts with a color
  const [probStartsWithRed, setProbStartsWithRed] = useState(0.5); // if a node starts with a color, the probability it is red over blue
  const [majorityThreshold, setMajorityThreshold] = useState(0.5); // threshold for a 'majority' color
  const [confidenceThreshold, setConfidenceThreshold] = useState(5); // number of repeat majority samples before accepted
  const [sampleCount, setSampleCount] = useState(5); // Number of other nodes each node will sample
  const [failureProbability, setFailureProbability] = useState(0);
  const [recoveryProbability, setRecoveryProbability] = useState(0.6);
  const intervalRef = useRef(undefined);

  const randomColor = () => {
    if (Math.random() <= probStartWithColor) {
      if (Math.random() <= probStartsWithRed) {
        return "RED";
      } else {
        return "BLUE";
      }
    } else {
      return "NOCOLOR";
    }
  };

  const initializeNodes = () => {
    let nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      const node = {
        id: i,
        color: randomColor(),
        nextColor: "",
        count: 0, // if we already have adopted a color, increase count for improved byzantine resistance
        colorConfidence: { RED: 0, BLUE: 0 }, // change color when confidence for one exceeds the other
        failed: false,
        accepted: false,
      };
      nodes.push(node);
    }
    return nodes;
  };

  const [nodes, setNodes] = useState(initializeNodes());

  const sampleNode = (newNodes, myId) => {
    let sampledNode = { id: -1 };
    do {
      sampledNode = nodes[Math.floor(Math.random() * nodes.length)];
    } while (sampledNode.id === myId);
    return sampledNode;
  };

  const simulate = () => {
    setSimulationRunning(true);
    intervalRef.interval = setInterval(() => {
      runSnowballRound();
    }, 500);
  };

  const runSnowballRound = () => {
    let newNodes = [...nodes];
    for (let node of newNodes) {
      if (node.accepted) {
        continue;
      }
      // failure chance
      if (node.failed) {
        if (Math.random() <= recoveryProbability) {
          node.failed = false;
          continue;
        }
      } else if (Math.random() <= failureProbability) {
        node.failed = true;
        continue;
      }
      if (node.color === "NOCOLOR") {
        continue; // wait until assigned color by being queried by a node with a color
      }
      let counts = { RED: 0, BLUE: 0 };
      for (let i = 0; i < sampleCount; i++) {
        const sampledNode = sampleNode(newNodes, node.id);
        if (sampledNode.failed) {
          continue;
        }
        if (sampledNode.color === "NOCOLOR") {
          // assign it our color
          sampledNode.nextColor = node.color;
          counts[node.color]++;
        } else {
          counts[sampledNode.color]++;
        }
      }
      let majority = false;
      for (let color of ["RED", "BLUE"]) {
        if (counts[color] > Math.ceil(sampleCount * majorityThreshold)) {
          majority = true;
          node.colorConfidence[color]++;
          if (node.colorConfidence[color] > node.colorConfidence[node.color]) {
            node.nextColor = color;
          }
          if (node.color !== color) {
            node.count = 1;
          } else {
            node.count++;
          }
          if (node.count >= confidenceThreshold) {
            // accept color
            node.accepted = true;
          }
        }
      }
      if (majority === false) {
        node.count = 0;
      }
      console.log(node.colorConfidence, node.count);
    }
    // assign next color only after round completes to prevent feedback loop
    for (let node of newNodes) {
      if (node.nextColor !== "") {
        node.color = node.nextColor;
        node.nextColor = "";
      }
    }
    setNodes(newNodes);

    if (nodes.every((n) => n.accepted)) {
      // we have consensus
      console.log("consensus!");
      clearInterval(intervalRef.interval);
      setSimulationRunning(false);
    }
  };

  return (
    <div className="App">
      <Center>
        <VStack>
          <Heading as="h1">Snowball Consensus Visualization</Heading>
          <Link href="https://github.com/kev-vin/snowball-visualization">
            View source on GitHub
          </Link>
          <Grid nodes={nodes} />
          <Flex>
            <Button
              mr={3}
              isDisabled={simulationRunning}
              onClick={simulate}
              colorScheme="blue"
            >
              Simulate
            </Button>
            <Button
              isDisabled={simulationRunning}
              onClick={() => setNodes(initializeNodes)}
            >
              Generate New Network
            </Button>
          </Flex>
          <Heading as="h2">Parameters</Heading>
          <Flex>
            <FormControl m={2}>
              <FormLabel>probStartWithColor</FormLabel>
              <Slider
                aria-label="slider-ex-1"
                defaultValue={0.2}
                min={0.1}
                step={0.01}
                max={1}
                onChange={(v) => setProbStartWithColor(v)}
                isDisabled={simulationRunning}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <FormHelperText>
                Probability that a node starts with a color
              </FormHelperText>
            </FormControl>
            <FormControl m={2}>
              <FormLabel>probStartsWithRed</FormLabel>
              <Slider
                aria-label="slider-ex-1"
                defaultValue={0.5}
                min={0.1}
                step={0.01}
                max={1}
                onChange={(v) => setProbStartsWithRed(v)}
                isDisabled={simulationRunning}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <FormHelperText>
                If a node starts with a color, the probability it is red over
                blue
              </FormHelperText>
            </FormControl>
          </Flex>
          <Flex>
            <FormControl m={2}>
              <FormLabel>majorityThreshold</FormLabel>
              <Slider
                aria-label="slider-ex-1"
                defaultValue={0.5}
                min={0.1}
                step={0.01}
                max={1}
                onChange={(v) => setMajorityThreshold(v)}
                isDisabled={simulationRunning}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <FormHelperText>
                Threshold for a sampled color to be considered a majority
              </FormHelperText>
            </FormControl>
            <FormControl m={2}>
              <FormLabel>confidenceThreshold</FormLabel>
              <Slider
                aria-label="slider-ex-1"
                defaultValue={5}
                min={2}
                step={1}
                max={20}
                onChange={(v) => setConfidenceThreshold(v)}
                isDisabled={simulationRunning}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <FormHelperText>
                Number of repeat majority samples before accepted
              </FormHelperText>
            </FormControl>
          </Flex>
          <Flex>
            <FormControl m={2}>
              <FormLabel>sampleCount</FormLabel>
              <Slider
                aria-label="slider-ex-1"
                defaultValue={0.5}
                min={0.1}
                step={0.01}
                max={1}
                onChange={(v) => setSampleCount(v)}
                isDisabled={simulationRunning}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <FormHelperText>
                Number of other nodes each node will sample
              </FormHelperText>
            </FormControl>
            <FormControl m={2}>
              <FormLabel>failureProbability</FormLabel>
              <Slider
                aria-label="slider-ex-1"
                defaultValue={0}
                min={0}
                step={0.01}
                max={0.5}
                onChange={(v) => setFailureProbability(v)}
                isDisabled={simulationRunning}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <FormHelperText>
                Likelihood that a node will fail in a given round
              </FormHelperText>
            </FormControl>
          </Flex>
          <Flex>
            <FormControl m={2}>
              <FormLabel>recoveryProbability</FormLabel>
              <Slider
                aria-label="slider-ex-1"
                defaultValue={0.6}
                min={0.2}
                step={0.01}
                max={1}
                onChange={(v) => setRecoveryProbability(v)}
                isDisabled={simulationRunning}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <FormHelperText>
                Likelihood that a failed node will rejoin the network in a given
                round
              </FormHelperText>
            </FormControl>
            <FormControl m={2}>
              <FormLabel>nodeCount</FormLabel>
              <Slider
                aria-label="slider-ex-1"
                defaultValue={100}
                min={10}
                step={1}
                max={250}
                onChange={(v) => setNodeCount(v)}
                isDisabled={simulationRunning}
              >
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
              <FormHelperText>
                The number of nodes in the network
              </FormHelperText>
            </FormControl>
          </Flex>
        </VStack>
      </Center>
    </div>
  );
};

export default App;
