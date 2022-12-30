const defaultLayout = {
  // name: "cose-bilkent",
  name: "fcose",

  // 'draft', 'default' or 'proof'
  // - "draft" only applies spectral layout
  // - "default" improves the quality with incremental layout (fast cooling rate)
  // - "proof" improves the quality with incremental layout (slow cooling rate)
  quality: "default",
  // Use random node positions at beginning of layout
  // if this is set to false, then quality option must be "proof"
  // randomize: true,
  // Whether or not to animate the layout
  animate: true,
  // Duration of animation in ms, if enabled
  animationDuration: 1000,
  // Easing of animation, if enabled
  animationEasing: undefined,
  // Fit the viewport to the repositioned nodes
  fit: true,
  // Padding around layout
  padding: 30,
  // Whether to include labels in node dimensions. Valid in "proof" quality
  nodeDimensionsIncludeLabels: true,
  // Whether or not simple nodes (non-compound nodes) are of uniform dimensions
  uniformNodeDimensions: false,
  // Whether to pack disconnected components - cytoscape-layout-utilities extension should be registered and initialized
  packComponents: true,
  // Layout step - all, transformed, enforced, cose - for debug purpose only
  step: "all",

  /* spectral layout options */

  // False for random, true for greedy sampling
  samplingType: true,
  // Sample size to construct distance matrix
  sampleSize: 25,
  // Separation amount between nodes
  nodeSeparation: 90,
  // Power iteration tolerance
  piTol: 0.0000001,

  /* incremental layout options */

  // Node repulsion (non overlapping) multiplier
  nodeRepulsion: (node) => {
    // return 45000 / node.degree(false);
    return 45000;
  },
  // Ideal edge (non nested) length
  idealEdgeLength: (edge) => {
    var min = Math.min(edge.source().degree(), edge.target().degree());
    if (min == 1) return 50;
    return (min / 2) * 50;

    // return 50;
  },

  // Divisor to compute edge forces
  edgeElasticity: (edge) => 5.45,
  // Nesting factor (multiplier) to compute ideal edge length for nested edges
  nestingFactor: 0.5,
  // Maximum number of iterations to perform - this is a suggested value and might be adjusted by the algorithm as required
  numIter: 500,
  // For enabling tiling
  tile: false,
  // Represents the amount of the vertical space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingVertical: 10,
  // Represents the amount of the horizontal space to put between the zero degree members during the tiling operation(can also be a function)
  tilingPaddingHorizontal: 10,
  // Gravity force (constant)
  gravity: 0.25,
  // Gravity range (constant) for compounds
  gravityRangeCompound: 1.5,
  // Gravity force (constant) for compounds
  gravityCompound: 1.0,
  // Gravity range (constant)
  gravityRange: 3.8,
  // Initial cooling factor for incremental layout
  initialEnergyOnIncremental: 0.3,

  /* constraint options */

  // Fix desired nodes to predefined positions
  // [{nodeId: 'n1', position: {x: 100, y: 200}}, {...}]
  fixedNodeConstraint: undefined,
  // Align desired nodes in vertical/horizontal direction
  // {vertical: [['n1', 'n2'], [...]], horizontal: [['n2', 'n4'], [...]]}
  alignmentConstraint: undefined,
  // Place two nodes relatively in vertical/horizontal direction
  // [{top: 'n1', bottom: 'n2', gap: 100}, {left: 'n3', right: 'n4', gap: 75}, {...}]
  relativePlacementConstraint: undefined,

  /* layout event callbacks */
  ready: () => {}, // on layoutready
  stop: () => {}, // on layoutstop
};

const defaultStylesheet = [
  {
    selector: "edge",
    style: {
      width: function (edge) {
        return 3;
        // look at all this overcomplex bullshit lol
        // var con = [edge.source().degree(), edge.target().degree()];
        // console.log(con)
        // if (con.includes(1)) return 3;
        // console.log(
        //   con.reduce((partialSum, a) => partialSum + a, 0),
        //   Math.max(
        //     3,
        //     Math.ceil(con.reduce((partialSum, a) => partialSum + a, 0) / 2)
        //   ) * 2
        // );
        // return (
        //   Math.max(
        //     3,
        //     Math.ceil(con.reduce((partialSum, a) => partialSum + a, 0) / 2)
        //   ) * 2
        // );
      },
      "line-color": "#ccc",
      "target-arrow-color": "#ccc",
      "target-arrow-shape": "triangle",
      "curve-style": "bezier",
    },
  },
  {
    selector: "edge.neighbor-selected",
    style: {
      "text-rotation": "autorotate",
      label: "data(label)",
    },
  },

  {
    selector: ".incoming",
    style: {
      "line-color": "blue",
    },
  },
  {
    selector: ".outgoing",
    style: {
      "line-color": "red",
    },
  },
  {
    selector: ".dotted",
    style: {
      "line-style": "dashed",
    },
  },

  {
    selector: "node",
    style: {
      "font-size": function (ele) {
        return Math.max(6, Math.ceil(ele.degree() / 2)) * 2;
      },
      "text-valign": "centre",
      "text-wrap": "wrap",
      shape: "round",
      "text-halign": "center",
      label: "data(label)",
      width: function (ele) {
        return Math.max(1, Math.ceil(ele.degree() / 2)) * 10;
      },
      height: function (ele) {
        return Math.max(1, Math.ceil(ele.degree() / 2)) * 10;
      },
    },
  },
  {
    selector: ".small",
    style: {
      "font-size": 5,
      width: 5,
      height: 5,
    },
  },

    {
    selector: "edge.small",
    style: {
      width: 1,
      'arrow-scale':0.5,
    },
  },
];

export { defaultLayout, defaultStylesheet };
