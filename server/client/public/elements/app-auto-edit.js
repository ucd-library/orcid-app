import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-auto-edit.html"
import { join } from "path";

export default class AppAutoEdit extends Mixin(PolymerElement)
  .with(EventInterface) {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      
    }
  }

  constructor() {
    super();
    this._injectModel('UcdModel');
  }

  ready() {
    super.ready();
    
    if( APP_CONFIG.user.data && APP_CONFIG.user.data.linked ) {
      this.UcdModel.autoUpdate();
    }
  }

  _onUcdAutoUpdateUpdate(e) {
    if( e.state !== 'loaded' ) return;

    console.log(e.payload.updates)
    if( e.payload.updates.length > 0 ) {
      this.$.message.innerHTML = e.payload.updates.join('<br />');
      this.style.display = 'block';
      setTimeout(() => this.style.display = 'none', 5000);
    } else {
      console.log('UCD Employement already up to date');
    }
  }

}

customElements.define('app-auto-edit', AppAutoEdit);