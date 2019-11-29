import "../scss/index.scss";
import "app-loading/app-loading.min.css";
import Highway from "@dogstudio/highway";
import api from "./api";
import { click } from "./utils";

let currentPage = 1;

export default class Renderer extends Highway.Renderer {
  onEnter() {
    currentPage = 1;
    let $posts = document.querySelector('.posts');
    creatPost(currentPage, $posts);
    click('loadMore', e => {
      creatPost(currentPage, $posts);
    });
  }
}

function creatPost(page, target) {
  const $loadStatus = document.querySelector('.loadStatus');
  $loadStatus.innerHTML = `<div class="loadEnd">加载中...</div>`;
  api.getIssueByPage(page).then(data => {
    if (data.length === 0) {
      $loadStatus.innerHTML = `<div class="loadEnd">已加载全部！</div>`;
      return;
    }
    const postHtml = data.map(item => {
      return `
        <div class="post-item">
            <div class="title">
              <a class="inner" href="post.html?id=${item.id}">
                ${item.title}
              </a>
            </div>
            <a class="poster" href="post.html?id=${item.id}" style="background-image: url(${item.poster})"></a>
            <div class="content">
              ${item.excerpt}
            </div>
            <div class="mate">
              <span>发布于 ${item.created_at}</span>
              ${item.tags.map(tag => `<span><a href="archive.html?tag=${encodeURIComponent(tag)}">#${tag}</a></span>`)}
            </div>
        </div>
      `
    }).join('');

    const $postLoad = document.querySelector('.post-load');
    $postLoad && $postLoad.remove();
    target.insertAdjacentHTML("beforeend", postHtml);
    $loadStatus.innerHTML = `<div class="loadMore">加载更多</div>`;
    currentPage++;
  })
}