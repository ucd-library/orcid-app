import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-checkbox.html"

export default class AppCheckbox extends PolymerElement {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      checked : {
        type : Boolean,
        value : false,
        reflectToAttribute : true,
        notify : true
      },
      'aria-checked' : {
        type : String,
        value : 'false',
        reflectToAttribute : true,
        computed : '_computeAriaChecked(checked)'
      },
      readonly : {
        type : Boolean,
        value : false,
        reflectToAttribute : true
      },
      'aria-readonly' : {
        type : String,
        value : 'true',
        reflectToAttribute : true,
        computed : '_computeAriaReadonly(readonly)'
      },
      role : {
        type : String,
        value : 'checkbox',
        reflectToAttribute : true
      },
      tabindex : {
        type : Number,
        value : 0,
        reflectToAttribute : true
      },
      labelledby : {
        type : String,
        value : '',
        reflectToAttribute : true,
        observer : '_ariaLabelledbyObserver'
      },
      'aria-labelledby' : {
        type : String,
        value : '',
        reflectToAttribute : true,
        computed : '_computeAriaLabelledby(labelledby)'
      }
    }
  }

  ready() {
    super.ready();
    this.addEventListener('click', e => this._onClick(e));
    this.addEventListener('keyup', e => this._onKeyUp(e));
  }

  connectedCallback() {
    super.connectedCallback();
    this._ariaLabelledbyObserver();
  }

  _onClick() {
    if( this.readonly ) return;
    this.toggle();
  }

  _onKeyUp(e) {
    if( this.readonly ) return;
    if( e.which === 13 || e.which === 32 ) {
      this.toggle();
    }
  }

  toggle() {
    this.checked = !this.checked;
    this.dispatchEvent(new CustomEvent('change', {detail: {checked: this.checked}}));
  }

  _computeAriaChecked(checked) {
    return checked ? 'true' : 'false';
  }

  _computeAriaReadonly(readonly) {
    return readonly ? 'true' : 'false';
  }

  _computeAriaLabelledby(labelledby) {
    return labelledby;
  }

  _ariaLabelledbyObserver() {
    if( !this['aria-labelledby'] || !this.parentNode ) return;
    if( this._labelListenerSet ) return;

    let label = this.parentNode.querySelector(`#${this['aria-labelledby']}`);
    if( !label ) return;

    label.addEventListener('click', e => this._onClick(e));
    this._labelListenerSet = true;
  }

}

customElements.define('app-checkbox', AppCheckbox);