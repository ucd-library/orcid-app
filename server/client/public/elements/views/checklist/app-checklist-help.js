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
    // let top = this.$.icon.offsetHeight + this.$.icon.offsetTop;
    // let left = this.$.icon.offsetLeft + (this.$.icon.offsetWidth / 2);

    this.$.popup.style.top = (5)+'px';
    this.$.popup.style.right = (-1*20)+'px';
    this.$.popup.style.display = 'block';
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
    e.preventDefault();
    e.stopPropagation();
  }

}

customElements.define('app-checklist-help', AppChecklistHelp);