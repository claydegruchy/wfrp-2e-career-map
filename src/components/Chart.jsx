import React from "react";
import { useState, useEffect } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import Cytoscape from "cytoscape";
import COSEBilkent from "cytoscape-cose-bilkent";
import fcose from "cytoscape-fcose";
import { defaultLayout, defaultStylesheet } from "./ChartDefaults";
import { Source } from "./Source";
import dagre from "cytoscape-dagre";

Cytoscape.use(COSEBilkent);
Cytoscape.use(fcose);
Cytoscape.use(dagre); // register extension

const makeNode = ({ data }) => ({
  group: "nodes",
  data: {
    classes: [],
    ...data,
  },
});
const makeEdge = ({ data }) => ({
  group: "edges",
  data: {
    classes: [],
    ...data,
    id: `${data.source}-${data.target}`,
  },
});

const data = [
  { data: { id: "2", label: "The results will be shown here" } },
  { data: { id: "1", label: "Search in the box to the left" } },
  {
    data: {
      id: "3",
      label: "Use Config>Loops to change search radius",
    },
    classes: ["small"],
  },
  {
    data: { source: "1", target: "2", label: "" },
  },
  {
    data: {
      id: "4",
      label: "Use Force Layout Update if things look weird",
    },
    classes: ["small"],
  },
  {
    data: {
      source: "2",
      target: "3",
      label: "",
    },
    classes: ["dotted", "small"],
  },
  {
    data: {
      source: "2",
      target: "4",
      label: "",
    },
    classes: ["dotted", "small"],
  },
];

const select = (node, cy) => {
  var mem = cy.scratch("selected");
  mem.push(node.id());
  cy.scratch("selected", mem);
};
const deselect = (node, cy) => {
  var mem = cy.scratch("selected");
  mem = mem.filter((n) => node.id() != n);
  cy.scratch("selected", mem);
};

const findInView = (cy, filter) => {
  //console.log('findInView');
  const ext = cy.extent();
  const nodesInView = cy.nodes(filter).filter((n) => {
    const bb = n.boundingBox();
    return bb.x1 > ext.x1 && bb.x2 < ext.x2 && bb.y1 > ext.y1 && bb.y2 < ext.y2;
  });
  return nodesInView;
};

const fullReloadLayout = async (cy, eles) => {
  console.log("reloading layout...");

  if (eles) {
    var collection = cy.collection(eles);
    // console.log(collection.length)
    collection = collection.merge(collection.outgoers());
    // console.log(collection.length)
    var layout = collection.layout(defaultLayout);
  } else {
    var layout = cy.layout(defaultLayout);
  }

  layout.run();

  return await layout.promiseOn("layoutstop").then(function (event) {
    return true;
  });
};

const partialReloadLayout = (cy, eles) => {
  var layout = cy.collection(eles).layout(defaultLayout);

  layout.run();
};

const Chart = ({
  uiOptions,
  setUiOptions,
  setChartData,
  setAddElementFunction,
  setPartialReloadLayout,
  setFullReloadLayout,
}) => {
  var url = new URL(window.location.href);
  var value = url.searchParams.get("target");

  const [cyRef, setCyRef] = useState();
  const [mapData, updateMapData] = useState(Source());

  // this only happens once
  React.useEffect(() => {
    if (!cyRef) return;
    var cy = cyRef;

    cy.centre();

    cy.ready(function (event) {
      // setup node mem
      if (!mem) cy.scratch("selected", []);
      var mem = cy.scratch("selected");
      setChartData({ cy: cyRef });

      // delete the weird nodes that the Delaunay creates
      cy.nodes("[^label]").remove();

      cy.scratch("uiOptions", uiOptions);
    });

    cy.on("viewport", function (event) {
      cy.nodes(".in-viewport").removeClass("in-viewport");

      findInView(cy).addClass("in-viewport");
    });

    cy.on("unselect", "node", function (event) {
      deselect(this, cy);
    });

    cy.on("select", "node", function (event) {
      // plot path
      select(this, cy);
    });

    cy.on("tapunselect", "node", function (event) {
      // plot path
      //console.log('tapunselect');
      setChartData({ cy: cyRef, tapunselectEvent: true });
    });

    cy.on("mouseover", "node", function (event) {
      this.addClass("hover");
    });
    cy.on("mouseout", "node", function (event) {
      cy.nodes(".hover").removeClass("hover");
    });

    cy.on("select", "node", function (event) {
      this.incomers().addClass("neighbor-selected incoming");
      this.outgoers().addClass("neighbor-selected outgoing");
    });
    cy.on("unselect", "node", function (event) {
      this.incomers().removeClass("neighbor-selected incoming");
      this.outgoers().removeClass("neighbor-selected outgoing");
    });

    // cy.on("click", function (event) {
    //   console.log(event.target.classes());
    // });

    cy.on("dblclick", "node", function (event) {
      console.log(event.target.data("id"));

      url.searchParams.set("target", event.target.data("id"));
      console.log(url.href);

      // url
      window.open(url.href, "_blank").focus();
    });

    setAddElementFunction((eleData) => (eleData) => {
      // console.log({ eleData });
      var lmao = eleData.reduce((previousValue, currentValue) => {
        const mergeEles = (ele, newNode) => {
          // console.log("merging", ele, newNode);
          var { label, classes, ...rest } = ele.data();
          if (!classes) classes = [];
          // console.log({ rest: ele.data() });
          ele.data(
            "label",
            [...new Set([...label.split("/"), newNode.data.label])].join("/")
          );

          ele.data("classes", [
            ...new Set([...classes, ...(newNode?.classes || [])]),
          ]);

          // a.
        };

        var search = cy.filter("#" + currentValue.data.id);
        // console.log({ search });
        if (search.length > 0) {
          mergeEles(search[0], currentValue);
        } else {
          previousValue.push(currentValue);
        }
        return previousValue;
      }, []);

      // find and remove dupe here

      var ele = cy.add(eleData);
      // console.log(ele.isEdge());

      return ele;
    });

    setPartialReloadLayout((eles) => (eles) => {
      partialReloadLayout(cy, eles);
      return eles;
    });

    setFullReloadLayout((eles) => async (eles) => {
      await fullReloadLayout(cy, eles);
    });

    // partialReloadLayout

    var target = cyRef.$("#" + value);

    var ins = target.incomers();
    var outs = target.outgoers();

    var coll = cyRef.collection([target, ...ins, ...outs]);

    coll.toggleClass("hidden");

    // cyRef.$(":hidden").remove()
    // console.log()

    // coll.layout(defaultLayout)

    // coll.layout({
    //   name: "dagre",
    //   rankDir: "LR", // 'TB' for top to bottom flow, 'LR' for left to right. default is undefined, making it plot top-bottom
    // }).run();
    // cyRef.fit(target);

    // console.log("ready", target);

    fullReloadLayout(coll);
  }, [cyRef]);

  // this happens each time the page is reloaded or the state is changed
  // dont set "on" events here, or they get multiplied each time the state changes, leading to lag
  React.useEffect(() => {
    if (!cyRef) return;
    var cy = cyRef;

    cy.ready(function (event) {
      // cyto doesnt always get along with states, so we handle that from here
      cy.scratch("uiOptions", uiOptions);

      var search = () => {
        cy.nodes(".found").removeClass("found");
        if (!uiOptions.search) return;
        var lowSearch = uiOptions.search.toLowerCase();
        if (lowSearch.length < 1) return;
        var found = cy
          .nodes()
          .filter(function (ele, i, eles) {
            var t = ele.data("label");
            if (t.toLowerCase().includes(lowSearch)) {
              return ele;
            }
          })
          .addClass("found");
        cy.fit(found, 50);
      };

      var updateLayout = () => {
        var { themes, selectedTheme } = cy.scratch("uiOptions");

        // cy.style(ChartStyle(themes[selectedTheme.value]));
      };

      updateLayout();
      search();
    });
  }, [uiOptions]);

  /*
what we do
start with no nodes
get a hint of a first (disney corperation)
query the API, ask for what that company owns
get the list of things it owns, then create them as nodes with connections


*/

  return (
    <div>
      <CytoscapeComponent
        className={"chart"}
        key={"ok"}
        cy={(cy) => {
          if (!cyRef) setCyRef(cy);
        }}
        zoom={2}
        style={
          {
            // width: '100%',
          }
        }
        // minZoom={0.2}
        maxZoom={50}
        elements={CytoscapeComponent.normalizeElements(mapData)}
        layout={defaultLayout}
        stylesheet={defaultStylesheet}
      />
    </div>
  );
};

export default Chart;
export { makeNode, makeEdge };
