/* Copyright 2016 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==============================================================================*/

import * as d3 from 'd3';

// Utility to parse CSV text into Example2D[] for classification/regression.
// Expected columns: x, y, values (or value). Extra columns are ignored.
// For classification, values are mapped to {-1, 1}: if value <= 0 -> -1, else -> 1.
export function parseCsvTextToExamples(csvText: string, isRegression: boolean): Example2D[] {
  try {
    // d3.csv.parse is available in d3 v3 for parsing CSV strings.
    let rows: any[] = d3.csv.parse(csvText);
    let out: Example2D[] = [];
    rows.forEach((row: any) => {
      // Support both "values" and "value" headers.
      let vx = row.x != null ? parseFloat(String(row.x)) : NaN;
      let vy = row.y != null ? parseFloat(String(row.y)) : NaN;
      let vraw = (row.values != null ? row.values : row.value);
      let vv = vraw != null ? parseFloat(String(vraw)) : NaN;
      if (isNaN(vx) || isNaN(vy) || isNaN(vv)) {
        return; // skip invalid rows
      }
      let label = isRegression ? vv : (vv <= 0 ? -1 : 1);
      out.push({x: vx, y: vy, label});
    });
    return out;
  } catch (e) {
    console.warn("Failed to parse CSV text", e);
    return [];
  }
}

// Helper to create a DataGenerator from a fixed set of examples.
export function generatorFromExamples(examples: Example2D[]): DataGenerator {
  // Return a function that ignores numSamples and noise (already baked into examples).
  return (numSamples: number, noise: number) => examples.slice();
}

// Dummy CSV-like datasets (hardcoded arrays) to be shown as presets until real data is provided.
export function classifyCsvDummy1(numSamples: number, noise: number): Example2D[] {
  // Two clusters roughly in top-right (label 1) and bottom-left (label -1).
  let pts: Example2D[] = [];
  function add(cx: number, cy: number, label: number, n: number) {
    for (let i = 0; i < n; i++) {
      let x = normalRandom(cx, 0.4 + noise);
      let y = normalRandom(cy, 0.4 + noise);
      pts.push({x, y, label});
    }
  }
  add(2.5, 2.5, 1, 80);
  add(-2.5, -2.5, -1, 80);
  return pts;
}

export function classifyCsvDummy2(numSamples: number, noise: number): Example2D[] {
  // Concentric circles: inner positive, outer negative (discrete labels).
  let pts: Example2D[] = [];
  for (let i = 0; i < 160; i++) {
    let r = Math.random() < 0.5 ? (1.0 + 0.2 * randUniform(-1, 1)) : (3.0 + 0.3 * randUniform(-1, 1));
    let t = randUniform(0, Math.PI * 2);
    let x = r * Math.cos(t);
    let y = r * Math.sin(t);
    let label = r < 2.0 ? 1 : -1;
    // Add some jitter as noise parameter.
    x += noise * randUniform(-1, 1);
    y += noise * randUniform(-1, 1);
    pts.push({x, y, label});
  }
  return pts;
}

export function regressCsvDummy1(numSamples: number, noise: number): Example2D[] {
  // Plane-like with noise, label ~ (x - y)/6 bounded to [-1,1].
  let pts: Example2D[] = [];
  let labelScale = d3.scale.linear().domain([-6, 6]).range([-1, 1]);
  for (let i = 0; i < 200; i++) {
    let x = randUniform(-5.5, 5.5);
    let y = randUniform(-5.5, 5.5);
    let nx = noise * randUniform(-1, 1);
    let ny = noise * randUniform(-1, 1);
    let label = labelScale((x + nx) - (y + ny));
    pts.push({x, y, label});
  }
  return pts;
}

export function regressCsvDummy2(numSamples: number, noise: number): Example2D[] {
  // Two gaussian hills: label is max of two radial bumps.
  let centers = [
    {x: -2.5, y: 2.0, s: 1},
    {x: 2.5, y: -2.0, s: -1}
  ];
  let labelScale = d3.scale.linear().domain([0, 4]).range([1, 0]).clamp(true);
  let pts: Example2D[] = [];
  for (let i = 0; i < 200; i++) {
    let x = randUniform(-6, 6);
    let y = randUniform(-6, 6);
    x += noise * randUniform(-1, 1);
    y += noise * randUniform(-1, 1);
    let best = 0;
    centers.forEach(c => {
      let v = c.s * labelScale(dist({x, y}, {x: c.x, y: c.y}));
      if (Math.abs(v) > Math.abs(best)) best = v;
    });
    pts.push({x, y, label: best});
  }
  return pts;
}

/**
 * A two dimensional example: x and y coordinates with the label.
 */
export type Example2D = {
  x: number,
  y: number,
  label: number
};

type Point = {
  x: number,
  y: number
};

/**
 * Shuffles the array using Fisher-Yates algorithm. Uses the seedrandom
 * library as the random generator.
 */
export function shuffle(array: any[]): void {
  let counter = array.length;
  let temp = 0;
  let index = 0;
  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    index = Math.floor(Math.random() * counter);
    // Decrease counter by 1
    counter--;
    // And swap the last element with it
    temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }
}

export type DataGenerator = (numSamples: number, noise: number) => Example2D[];

export function classifyTwoGaussData(numSamples: number, noise: number):
    Example2D[] {
  let points: Example2D[] = [];

  let varianceScale = d3.scale.linear().domain([0, .5]).range([0.5, 4]);
  let variance = varianceScale(noise);

  function genGauss(cx: number, cy: number, label: number) {
    for (let i = 0; i < numSamples / 2; i++) {
      let x = normalRandom(cx, variance);
      let y = normalRandom(cy, variance);
      points.push({x, y, label});
    }
  }

  genGauss(2, 2, 1); // Gaussian with positive examples.
  genGauss(-2, -2, -1); // Gaussian with negative examples.
  return points;
}

export function regressPlane(numSamples: number, noise: number):
  Example2D[] {
  let radius = 6;
  let labelScale = d3.scale.linear()
    .domain([-10, 10])
    .range([-1, 1]);
  let getLabel = (x, y) => labelScale(x + y);

  let points: Example2D[] = [];
  for (let i = 0; i < numSamples; i++) {
    let x = randUniform(-radius, radius);
    let y = randUniform(-radius, radius);
    let noiseX = randUniform(-radius, radius) * noise;
    let noiseY = randUniform(-radius, radius) * noise;
    let label = getLabel(x + noiseX, y + noiseY);
    points.push({x, y, label});
  }
  return points;
}

export function regressGaussian(numSamples: number, noise: number):
  Example2D[] {
  let points: Example2D[] = [];

  let labelScale = d3.scale.linear()
    .domain([0, 2])
    .range([1, 0])
    .clamp(true);

  let gaussians = [
    [-4, 2.5, 1],
    [0, 2.5, -1],
    [4, 2.5, 1],
    [-4, -2.5, -1],
    [0, -2.5, 1],
    [4, -2.5, -1]
  ];

  function getLabel(x, y) {
    // Choose the one that is maximum in abs value.
    let label = 0;
    gaussians.forEach(([cx, cy, sign]) => {
      let newLabel = sign * labelScale(dist({x, y}, {x: cx, y: cy}));
      if (Math.abs(newLabel) > Math.abs(label)) {
        label = newLabel;
      }
    });
    return label;
  }
  let radius = 6;
  for (let i = 0; i < numSamples; i++) {
    let x = randUniform(-radius, radius);
    let y = randUniform(-radius, radius);
    let noiseX = randUniform(-radius, radius) * noise;
    let noiseY = randUniform(-radius, radius) * noise;
    let label = getLabel(x + noiseX, y + noiseY);
    points.push({x, y, label});
  };
  return points;
}

export function classifySpiralData(numSamples: number, noise: number):
    Example2D[] {
  let points: Example2D[] = [];
  let n = numSamples / 2;

  function genSpiral(deltaT: number, label: number) {
    for (let i = 0; i < n; i++) {
      let r = i / n * 5;
      let t = 1.75 * i / n * 2 * Math.PI + deltaT;
      let x = r * Math.sin(t) + randUniform(-1, 1) * noise;
      let y = r * Math.cos(t) + randUniform(-1, 1) * noise;
      points.push({x, y, label});
    }
  }

  genSpiral(0, 1); // Positive examples.
  genSpiral(Math.PI, -1); // Negative examples.
  return points;
}

export function classifyCircleData(numSamples: number, noise: number):
    Example2D[] {
  let points: Example2D[] = [];
  let radius = 5;
  function getCircleLabel(p: Point, center: Point) {
    return (dist(p, center) < (radius * 0.5)) ? 1 : -1;
  }

  // Generate positive points inside the circle.
  for (let i = 0; i < numSamples / 2; i++) {
    let r = randUniform(0, radius * 0.5);
    let angle = randUniform(0, 2 * Math.PI);
    let x = r * Math.sin(angle);
    let y = r * Math.cos(angle);
    let noiseX = randUniform(-radius, radius) * noise;
    let noiseY = randUniform(-radius, radius) * noise;
    let label = getCircleLabel({x: x + noiseX, y: y + noiseY}, {x: 0, y: 0});
    points.push({x, y, label});
  }

  // Generate negative points outside the circle.
  for (let i = 0; i < numSamples / 2; i++) {
    let r = randUniform(radius * 0.7, radius);
    let angle = randUniform(0, 2 * Math.PI);
    let x = r * Math.sin(angle);
    let y = r * Math.cos(angle);
    let noiseX = randUniform(-radius, radius) * noise;
    let noiseY = randUniform(-radius, radius) * noise;
    let label = getCircleLabel({x: x + noiseX, y: y + noiseY}, {x: 0, y: 0});
    points.push({x, y, label});
  }
  return points;
}

export function classifyXORData(numSamples: number, noise: number):
    Example2D[] {
  function getXORLabel(p: Point) { return p.x * p.y >= 0 ? 1 : -1; }

  let points: Example2D[] = [];
  for (let i = 0; i < numSamples; i++) {
    let x = randUniform(-5, 5);
    let padding = 0.3;
    x += x > 0 ? padding : -padding;  // Padding.
    let y = randUniform(-5, 5);
    y += y > 0 ? padding : -padding;
    let noiseX = randUniform(-5, 5) * noise;
    let noiseY = randUniform(-5, 5) * noise;
    let label = getXORLabel({x: x + noiseX, y: y + noiseY});
    points.push({x, y, label});
  }
  return points;
}

/**
 * Returns a sample from a uniform [a, b] distribution.
 * Uses the seedrandom library as the random generator.
 */
function randUniform(a: number, b: number) {
  return Math.random() * (b - a) + a;
}

/**
 * Samples from a normal distribution. Uses the seedrandom library as the
 * random generator.
 *
 * @param mean The mean. Default is 0.
 * @param variance The variance. Default is 1.
 */
function normalRandom(mean = 0, variance = 1): number {
  let v1: number, v2: number, s: number;
  do {
    v1 = 2 * Math.random() - 1;
    v2 = 2 * Math.random() - 1;
    s = v1 * v1 + v2 * v2;
  } while (s > 1);

  let result = Math.sqrt(-2 * Math.log(s) / s) * v1;
  return mean + Math.sqrt(variance) * result;
}

/** Returns the eucledian distance between two points in space. */
function dist(a: Point, b: Point): number {
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
