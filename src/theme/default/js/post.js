import "../scss/post.scss";
import Highway from "@dogstudio/highway";
import { getURLParameters, setTitle } from "./utils";
import api from "./api";
import Gitting from "gitting";

let gitting = null;
export default class Renderer extends Highway.Renderer {
  onEnter() {
    const { id } = getURLParameters();
    const $title = document.querySelector(".page-post .title");
    const $mate = document.querySelector(".page-post .mate");
    const $content = document.querySelector(".page-post .content");
    api.getIssueById(parseInt(id)).then(data => {
      setTitle(data.title);
      $title.innerHTML = data.title;
      $mate.innerHTML = `<span>发布于 ${data.created_at}</span>${data.tags.map(tag => `<span><a href="archive.html?tag=${encodeURIComponent(tag)}">#${tag}</a></span>`)}`
      $content.innerHTML = data.html;
      gitting && gitting.destroy && gitting.destroy();
      gitting = new Gitting({
        ...__config__.website.github,
        number: parseInt(id),
      });
      gitting.render("#gitting-container");
    }).catch(err => {
      window.location.href = '/404.html'
    });
  }
}
