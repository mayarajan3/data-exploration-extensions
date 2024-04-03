import { ArgumentType, MenuItem, BlockType, copyTo, SaveDataHandler, ExtensionMenuDisplayDetails, extension, buttonBlock, block, untilTimePassed, rgbToHex, RGBObject } from "$common";
import { getImageHelper } from './utils'
import FileOpener from './FileOpener.svelte'
import FeatureArgument from './FeatureArgument.svelte'
import FeatureChecklist from './FeatureChecklist.svelte'
import MLR from "ml-regression-multivariate-linear";

const details: ExtensionMenuDisplayDetails = {
  name: "Data Visualization",
  description: "Explore your data with graphs!",
  iconURL: "Typescript_logo.png",
  insetIconURL: "typescript-logo.svg",
  tags: ["PRG Internal"]
};

var data = {};
export var features = ["..."];

// Stat calculation functions
function mean(array: number[]): number {
  const sum = array.reduce((acc: number, val: number) => acc + val, 0);
  return sum / array.length;
}

function median(array: number[]): number {
  const sortedArray = array.slice().sort((a: number, b: number) => a - b);
  const midIndex = Math.floor(sortedArray.length / 2);
  
  if (sortedArray.length % 2 === 0) {
      return (sortedArray[midIndex - 1] + sortedArray[midIndex]) / 2;
  } else {
      return sortedArray[midIndex];
  }
}

function mode(array: number[]): number {
  const frequencyMap = new Map();
  let maxFrequency = 0;
  let modes = [];
  array.forEach(element => {
      const frequency = (frequencyMap.get(element) || 0) + 1;
      frequencyMap.set(element, frequency);
      if (frequency > maxFrequency) {
          maxFrequency = frequency;
          modes = [element];
      } else if (frequency === maxFrequency) {
          modes.push(element);
      }
  });
  return modes[0];
}

function range(arr: number[]): number {
  if (arr.length === 0) return null; // Return null for empty arrays
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  return max - min;
}


export default class dataVisualization extends extension(details, "ui", "customArguments", "customSaveData", "drawable", "addCostumes") {

  DIMENSIONS = [480, 360];

  imageHelper: ReturnType<typeof getImageHelper>;
  drawableLayer: ReturnType<typeof this.createDrawable>;
  drawables: ReturnType<typeof this.createDrawable>[] = [];
  
  color: string;
  thickness: number;
  tick: number;

  // Functions responsible for drawing graphs
  async drawBar(list1: number[], list2: number[]) {
    const { drawableLayer, imageHelper } = this;
    const rects = imageHelper.createBarChart(0, 0, list1, list2, this.DIMENSIONS[0], this.DIMENSIONS[1], this.color, this.tick)
    this.drawableLayer.update(rects);
  }
  async drawLine(list1: number[], list2: number[]) {
    const { drawableLayer, imageHelper } = this;
    const rects = imageHelper.createLineGraph(0, 0, list1, list2, this.DIMENSIONS[0], this.DIMENSIONS[1], this.color, this.tick)
    drawableLayer.update(rects);
  }

  async drawScatter(list1: number[], list2: number[]) {
    const { drawableLayer, imageHelper } = this;
    const rects = imageHelper.createScatterPlot(0, 0, list1, list2, this.DIMENSIONS[0], this.DIMENSIONS[1], this.color, this.tick)
    drawableLayer.update(rects);
  }

  // Clearing the scene
  clearFrame() {
    this.drawableLayer.update(this.imageHelper.clearRectangle());
  }

  async init() {
    this.imageHelper = getImageHelper(this.DIMENSIONS[0], this.DIMENSIONS[1])
    this.color = 'black'
    this.thickness = 5
    this.tick = 5;
    // Initializing the drawableLayer
    const rects = this.imageHelper.createScatterPlot(0, 0, [0, 1, 2], [3, 4, 5], this.DIMENSIONS[0], this.DIMENSIONS[1], this.color, this.tick)
    this.drawableLayer = this.createDrawable(rects);
    this.drawables.push(this.drawableLayer);
    this.drawableLayer.update(this.imageHelper.clearRectangle());
  }

  // Parsing through the uploaded CSV file to get data
  async setData(csvData: string) {
    const rows = csvData.split('\n'); 
    const allData = rows.map(row => row.split(',')); 
    const headers = allData[0];
    const columnDict = {};
    features = [];
    headers.forEach((header, index) => {
        const values = allData.slice(1).map(row => row[index]);
        columnDict[header] = values;
        features.push(header);
    });
    data = columnDict;
  }

  // Converting lists into numbers
  processList(list : string[]) : number[] {
    return list.map((num)=> {
      return parseFloat(num);
    })
  }
  
  @buttonBlock("Upload file")
  showFileOpener() {
    this.openUI("FileOpener", "Upload a file here!");
  }

  @block({
    type: BlockType.Command,
    text: `Clear frames`,
  })
  clearFrames() {
    this.clearFrame();
  }

  // Blocks for setting values
  @block({
    type: BlockType.Command,
    text: (color) => `Set color to ${color}`,
    arg: "color"
  })
  setColor(color: RGBObject) {
    this.color = rgbToHex(color);
  }

  @block({
    type: BlockType.Command,
    text: (value) => `Set tick values to ${value}`,
    arg: {type: ArgumentType.Number, defaultValue: 5},
  })
  setTick(value: number) {
    this.tick = value;
  }

  // Blocks for drawing graphs
  @block((self) => ({
    type: BlockType.Command,
    text: (feature1, feature2) => `Draw line plot with x values: ${feature1}; y values: ${feature2}`,
    args: [self.makeCustomArgument({
      component: FeatureArgument,
      initial: { value: features[0], text: features[0] }
    }), self.makeCustomArgument({
      component: FeatureArgument,
      initial: { value: features[0], text: features[0] }
    })],
  }))
  drawLinePlot(test1: string, test2: string) {
    let list1 = this.processList(data[test1] ? data[test1] : []);
    let list2 = this.processList(data[test2] ? data[test2] : []);

    let valid = list1.length > 0 && test2.length > 0 && !list1.includes(NaN) && !list2.includes(NaN);

    if (valid) {
      this.drawLine(list1, list2);
    } else {
      alert("Invalid type detected");
    }
  }

  @block((self) => ({
    type: BlockType.Command,
    text: (feature1, feature2) => `Draw scatter plot with x: ${feature1}; y: ${feature2}`,
    args: [self.makeCustomArgument({
      component: FeatureArgument,
      initial: { value: features[0], text: features[0] }
    }), self.makeCustomArgument({
      component: FeatureArgument,
      initial: { value: features[0], text: features[0] }
    })],
  }))
  drawScatterPlot(test1: string, test2: string) {

    let list1 = this.processList(data[test1] ? data[test1] : []);
    let list2 = this.processList(data[test2] ? data[test2] : []);

    let valid = list1.length > 0 && test2.length > 0 && !list1.includes(NaN) && !list2.includes(NaN);

    if (valid) {
      this.drawScatter(list1, list2);
    } else {
      alert("Invalid type detected");
    }
  }

  @block((self) => ({
    type: BlockType.Command,
    text: (feature1, feature2) => `Draw bar chart with x: ${feature1}; y: ${feature2}`,
    args: [self.makeCustomArgument({
      component: FeatureArgument,
      initial: { value: features[0], text: features[0] }
    }), self.makeCustomArgument({
      component: FeatureArgument,
      initial: { value: features[0], text: features[0] }
    })],
  }))
  drawBarChart(test1: string, test2: string) {

    let list1 = this.processList(data[test1] ? data[test1] : []);
    let list2 = this.processList(data[test2] ? data[test2] : []);

    let valid = list1.length > 0 && test2.length > 0 && !list1.includes(NaN) && !list2.includes(NaN);

    if (valid) {
      this.drawBar(list1, list2);
    } else {
      alert("Invalid type detected");
    }
  }

  // Block for calculating statistics
  @block((self) => ({
    type: BlockType.Reporter,
    text: (stat, feature) => `Get ${stat} from ${feature}`,
    args: [{type: ArgumentType.String, options: [
      { value: 'mean', text: 'mean' },
      { value: 'median', text: 'median' },
      { value: 'mode', text: 'mode' },
      { value: 'max', text: 'max' },
      { value: 'min', text: 'min' },
      { value: 'range', text: 'range' }
    ]}, self.makeCustomArgument({
      component: FeatureArgument,
      initial: { value: features[0], text: features[0] }
    })],
  }))
  setStat(stat: string, feature: string) : number {
    let list = this.processList(data[feature] ? data[feature] : []);
    let valid = list.length > 0 && !list.includes(NaN);
    if (!valid) {
      alert("Invalid data type detected")
      return 0;
    }
    switch (stat) {
      case "mean":
        return mean(list);
      case "median":
        return median(list);
      case "mode":
        return mode(list);
      case "max":
        return Math.max(...list);
      case "min":
        return Math.min(...list);
      case "range":
        return range(list);
      default:
        return 0
    }
  }

  // Blocks for predicting values
  @block((self) => ({
    type: BlockType.Reporter,
    text: (x, y) => `Predict ${y} from x values: ${x}`,
    args: [self.makeCustomArgument({
      component: FeatureChecklist,
      initial: { value: [], text: "Nothing selected" }
    }), self.makeCustomArgument({
      component: FeatureArgument,
      initial: { value: features[0], text: features[0] }
    })],
  }))
  createModel(x: string[][], y: string): number {
    // Making sure x and y values are valid
    if (x.length > 0 && data[y]) {
      // Gathering x features
      let xFeatures = x.map(str => {
        return str[0];
      });
      // Getting x and y arrays
      let yVals = []
      const xVals = data[xFeatures[0]].map((value: number, index: number) => {
        yVals.push([parseFloat(data[y][index])])
        let row = [];
        for (let i = 0; i < x.length; i++) {
          row.push(parseFloat(data[xFeatures[i]][index]));
        }
        return row;
      });
      // Gathering prediction x values
      const predictionsX = x.map(str => {
        return parseFloat(str[1]);
      })
      if (!xVals.includes(NaN) && !yVals.includes(NaN) && !predictionsX.includes(NaN)) {
        // Training the regression model
        const mlr = new MLR(xVals, yVals);
        // Making a prediction using the model
        return mlr.predict(predictionsX)[0];
      } else {
        alert("Invalid type detected")
      }
    } else {
      alert("No x or y features selected");
    }
    
  }

}