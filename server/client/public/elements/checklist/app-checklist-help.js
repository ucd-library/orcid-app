import {PolymerElement, html} from "@polymer/polymer"
import "@polymer/paper-icon-button"
import template from "./app-checklist-help.html"

export default class AppChecklistHelp extends PolymerElement {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      
    }
  }

  constructor() {
    super();
    window.addEventListener('click', (e) => {
      if( e.path.indexOf(this) > -1 ) return;
      this.hide();
    });
  }

  show() {
    let top = this.$.icon.offsetHeight + this.$.icon.offsetTop;
    let left = this.$.icon.offsetLeft + (this.$.icon.offsetWidth / 2);

    this.$.popup.style.top = (5)+'px';
    this.$.popup.style.right = (-1*20)+'px';
    this.$.popup.style.display = 'block';
    this.showing = true;
  }

  hide() {
    if( !this.showing ) return;
    this.$.popup.style.display = 'none';
    this.showing = false;
  }

  _onBtnClicked(e) {
    // e.preventDefault();
    // e.stopPropagation();
    
    if( this.showing ) this.hide();
    else this.show();
  }

  _onPopupClicked(e) {
    e.preventDefault();
    e.stopPropagation();
  }

}

customElements.define('app-checklist-help', AppChecklistHelp);