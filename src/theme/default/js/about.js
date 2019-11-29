import "../scss/about.scss";
import Highway from "@dogstudio/highway";
import { setTitle } from "./utils";
import api from "./api";

export default class Renderer extends Highway.Renderer {
  onEnter() {
    const $title = document.querySelector(".page-about .title");
    const $content = document.querySelector(".page-about .content");
    api.getIssueByLabel('about' + ',page').then(data => {
      data = data[0];
      setTitle(data.title);
      $title.innerHTML = data.title;
      $content.innerHTML = data.html;
    });
  }
}
