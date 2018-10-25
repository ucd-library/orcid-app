import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-completed-chart.html"

export default class AppCompletedChart extends PolymerElement {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      percent : {
        type : Number,
        value : 0,
        observer : '_redraw'
      },
      height : {
        type : Number,
        value : 200,
        observer : '_heightObserver'
      },
      width: {
        type : Number,
        value : 200,
        observer : '_widthObserver'
      },
      complete : {
        type : Boolean,
        computed : '_computeComplete(percent)'
      }
    }
  }

  ready() {
    super.ready();
    this.ctx = this.$.canvas.getContext('2d');
    this._redraw();
  }

  _computeComplete(percent) {
    return (percent >= 100) ? true : false;
  }

  _heightObserver() {
    this.$.outer.style.height = this.height+'px';
  }

  _widthObserver() {
    this.$.outer.style.width = this.width+'px';
  }

  /**
   * @method _redraw
   * @description redraw the complete circle chart bases on percent property
   */
  _redraw() {
    if( !this.ctx ) return;

    let centerX = this.width/2;
    let centerY = this.height/2;
    let lineWidth = 15;
    let circleWidth = centerX > centerY ? centerX-lineWidth : centerY-lineWidth;

    this.ctx.clearRect(0,0,this.height, this.width);
    
    this.ctx.beginPath();
    this.ctx.lineWidth = 15;
    this.ctx.strokeStyle = '#e6e6e6';
    this.ctx.arc(centerX, centerY, circleWidth, 0, Math.PI*2, true);
    this.ctx.stroke();
    this.ctx.closePath();

    this.ctx.beginPath();

    let top = Math.PI*1.5;
    let end = top - (Math.PI*2*(this.percent/100));
    if( end < 0 ) end = (Math.PI*2)+end;

    if( top === end ) {
      top = 0;
      end = Math.PI*2;
    }

    this.ctx.strokeStyle = '#97c144';
    this.ctx.arc(centerX, centerY, circleWidth, top, end, true);
    this.ctx.stroke();
    this.ctx.closePath();
  }

}

customElements.define('app-completed-chart', AppCompletedChart);