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
    const canvas = document.getElementById('canvas');
  }
  componentDidMount() {
    this.renderCanvas();
  }
  render() {
    return (
      <div className="App">
        <canvas id="canvas"></canvas>
      </div>
    );
  }
}

export default App;
