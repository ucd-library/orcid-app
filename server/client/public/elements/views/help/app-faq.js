import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-faq.html"

export default class AppFaq extends PolymerElement {

  static get template() {
    return html([template]);
  }

}

customElements.define('app-faq', AppFaq);