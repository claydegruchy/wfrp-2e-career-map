import data from "./careers.json";

var node = (title) => ({
  data: {
    id: title,
    label: title,
  },
  classes: ["small"],
});
var edge = (source, target) => ({
  data: {
    source,
    target,
  },
  // classes: ["dotted", "small"],
});

var titles = data.map((t) => t.title);

const Source = (props) => {
  var out = [];
  for (const { title, entries, exits } of data) {
    out.push(node(title));

    entries.forEach((e) => {
      if (titles.includes(e)) out.push(edge(title, e));
    });

exits.forEach((e) => {
      if (titles.includes(e)) out.push(edge( e,title));
    });

  }
  return out;
};

export { Source };
