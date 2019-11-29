import "../scss/friends.scss";
import Highway from "@dogstudio/highway";
import { setTitle } from "./utils";
import api from "./api";

export default class Renderer extends Highway.Renderer {
  onEnter() {
    const $title = document.querySelector(".page-friends .title");
    const $content = document.querySelector(".page-friends .content");
    api.getIssueByLabel('friends' + ',page').then(data => {
      data = data[0];
      setTitle(data.title);
      $title.innerHTML = data.title;
      $content.innerHTML = data.html;
    });
  }
}
