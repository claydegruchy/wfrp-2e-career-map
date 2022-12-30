import { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import Select from "react-select";
import Chart from "./components/Chart";


var defaultUiParams = {};

function App() {
  const [uiOptions, setUiOptions] = useState(defaultUiParams);
  const [chartData, setChartData] = useState({ cy: null });
  const [addElementFunction, setAddElementFunction] = useState();
  const [partialReloadLayout, setPartialReloadLayout] = useState();
  const [fullReloadLayout, setFullReloadLayout] = useState();

  useEffect(() => {
    // Stuff to do when the UI updates
  }, [uiOptions]);

  const SearchableDropdown = ({ label, options, selectParams }) => {
    const set = (e) => setUiOptions({ ...uiOptions, [label]: e });
    return (
      <div>
        {/*this select package really fucking sucks ass, the style application
         system is garbo and akin to banging rocks together */}
        <Select
          // isClearable
          {...selectParams}
          // placeholder={''}
          value={uiOptions[label]}
          onChange={set}
          // theme={themes[uiOptions.selectedTheme.value]}
          // styles={dropDownStyles}
          options={options}
        />
      </div>
    );
  };
  const Checkbox = ({ label, secretMessage }) => {
    const set = (e) =>
      setUiOptions({ ...uiOptions, [label]: !uiOptions[label] });
    return (
      <div title={secretMessage}>
        <input
          name={label}
          type="checkbox"
          checked={uiOptions[label]}
          onChange={set}
        />
        <div>{label}</div>
      </div>
    );
  };
  return (
    <div className="App">
      <div>
        <Chart
          className={""}
          setChartData={setChartData}
          setAddElementFunction={setAddElementFunction}
          setPartialReloadLayout={setPartialReloadLayout}
          setFullReloadLayout={setFullReloadLayout}
          uiOptions={uiOptions}
          setUiOptions={setUiOptions}
        />
      </div>
    </div>
  );
}

export default App;
