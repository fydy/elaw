import "../scss/archive.scss";
import Highway from "@dogstudio/highway";
import { getURLParameters, setTitle } from "./utils";
import api from "./api";

export default class Renderer extends Highway.Renderer {
  onEnter() {
    let { tag } = getURLParameters();
    const $title = document.querySelector('.page-archive .title');
    if (tag) {
      tag = decodeURIComponent(tag);
      setTitle(tag + ' - 归档');
      $title.innerHTML = `标签: ${tag}`;
      api.getIssueByLabel(tag + ',post').then(creatArchive);
    } else {
      setTitle('归档');
      $title.innerHTML = `全部文章`;
      api.getIssueByLabel('post').then(creatArchive);
    }
  }
}

function creatArchive(data) {
  const $content = document.querySelector('.page-archive .content');
  const archiveHtml = data.map(item => {
    return `
        <div class="archive-item">
            <a href="/post.html?id=${item.id}" class="title" title="${item.title}">${item.title}</a>
            <div class="meta clearfix">
                <span>发布于 ${item.created_at}</span>
                ${item.tags.map(tag => `<span><a href="/archive.html?tag=${encodeURIComponent(tag)}" title="${tag}">#${tag}</a></span>`).join('')}
            </div>
        </div>
    `;
  }).join('');
  $content.innerHTML = archiveHtml;
}