import "../scss/message.scss";
import Highway from "@dogstudio/highway";
import { setTitle } from "./utils";
import api from "./api";
import Gitting from "gitting";

let gitting = null;
export default class Renderer extends Highway.Renderer {
  onEnter() {
    const $title = document.querySelector(".page-message .title");
    const $content = document.querySelector(".page-message .content");
    api.getIssueByLabel('message' + ',page').then(data => {
      data = data[0];
      setTitle(data.title);
      $title.innerHTML = data.title;
      $content.innerHTML = data.html;
      gitting && gitting.destroy && gitting.destroy();
      gitting = new Gitting({
        ...__config__.website.github,
        id: 'message'
      });
      gitting.render("#gitting-container");
    });
  }
}
