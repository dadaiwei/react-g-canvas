import React from 'react';
import {Canvas} from './g-canvas/lib/index';
import logo from './logo.svg';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.renderCanvas = this.renderCanvas.bind(this);
  }
  renderCanvas() {
    const canvas = new Canvas({
      container: 'container',
      width: 600,
      height: 500,
    });
    console.log(canvas);
    const shape = canvas.addShape('circle', {
      attrs: {
        x: 300,
        y: 200,
        r: 100,
        fill: '#1890FF',
        stroke: '#F04864',
        lineWidth: 4,
        radius: 8,
      },
    });
    console.log(shape);
  }
  componentDidMount() {
    this.renderCanvas();
  }
  render() {
    return (
      <div className="App">
        <div id="container"></div>
      </div>
    );
  }
}

export default App;
