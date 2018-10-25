import {PolymerElement, html} from "@polymer/polymer"
import "@polymer/paper-icon-button"
import template from "./app-checklist-help.html"

export default class AppChecklistHelp extends PolymerElement {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      help : {
        type : String,
        value : '',
        observer : '_helpObserver'
      },
      showing : {
        type : Boolean,
        value : false
      },
      initWidth : {
        type : Number,
        value : 300
      }
    }
  }

  constructor() {
    super();
    window.addEventListener('click', (e) => {
      if( !this.showing ) return;

      var path = e.path || (e.composedPath && e.composedPath());
      if( path.indexOf(this) > -1 ) return;
      this.hide();
    });

    window.addEventListener('resize', e => {
      if( !this.showing ) return;
      this.show(); // resize
    })
  }

  ready() {
    super.ready();
  }

  _helpObserver() {
    if( !this.$.popup ) return;
    this.$.popup.innerHTML = this.help;
  }

  /**
   * @method show
   * @description show checklist help popup
   */
  show() {
    this.$.popup.style.top = (5)+'px';
    this.$.popup.style.display = 'block';
    this.$.popup.style.right = '0px';

    let left = this.offsetLeft;
    let right = this.offsetWidth+left;

    if( 0 < right-this.initWidth-20 ) {
      this.$.popup.style.width = this.initWidth+'px';
    } else {
      let w = window.innerWidth;
      this.$.popup.style.width = (w-10)+'px';
    }

    this.showing = true;
  }

  /**
   * @method hide
   * @description hide checklist help popup
   */
  hide() {
    if( !this.showing ) return;
    this.$.popup.style.display = 'none';
    this.showing = false;
  }

  /**
   * @method _onBtnClicked
   * @description bound to help icon click event
   */
  _onBtnClicked() {    
    if( this.showing ) this.hide();
    else this.show();
  }

  /**
   * @method _onPopupClicked
   * @description bound to popup panel click event
   */
  _onPopupClicked(e) {
    // if( !this.showing ) return;

    // var path = e.path || (e.composedPath && e.composedPath());
    // if( path.length > 0 && path[0].nodeName === 'A' ) {
    //   return;
    // }

    // e.preventDefault();
    // e.stopPropagation();
  }

}

customElements.define('app-checklist-help', AppChecklistHelp);