import {
  request,
  queryStringify,
  truncateString,
  relative,
  insertImg
} from "./utils";
const {
  github,
  post
} = __config__.website;

let idMap = new Map;
let pageMap = new Map;
let labelsMap = new Map;

function postMap(map, key, val) {
  if (!key || !val) return map;
  if (!map.get(key)) map.set(key, []);
  map.set(key, [...new Set([...map.get(key), val])]);
  return map;
}

function formatPost(item, page, labels) {
  const postData = {
    title: item.title,
    html: item.body_html,
    created_at: relative(item.created_at),
    updated_at: relative(item.updated_at),
    comments: item.comments,
    tags: item.labels.filter(tag => tag.name !== "post").map(tag => tag.name),
    url: item.url,
    id: item.number
  };

  try {
    postData.excerpt = truncateString(
      item.body_text.replace(/[\r\n]/g, ""),
      post.excerpt
    );
  } catch (error) {
    postData.excerpt = "";
  }

  try {
    postData.poster = /src=[\'\"]?([^\'\"]*)[\'\"]?/i.exec(
      /<img.*?(?:>|\/>)/.exec(item.body_html)[0]
    )[1];
  } catch (error) {
    postData.poster = insertImg("poster.png");
  }

  postMap(idMap, postData.id, postData);
  postMap(pageMap, page, postData);
  postMap(labelsMap, labels, postData);

  return postData;
}

function creatApi() {
  const issuesApi = `https://api.github.com/repos/${github.owner}/${github.repo}/issues`;

  const baseQuery = {
    client_id: github.clientID,
    client_secret: github.clientSecret
  };

  return {
    // 通过分页获取issue
    getIssueByPage(page, type = 'full') {
      if (pageMap.has(page)) {
        return Promise.resolve(pageMap.get(page))
      }

      const query = Object.assign({}, baseQuery, {
        per_page: post.pageSize,
        page: page,
        labels: 'post',
        t: (new Date).getTime()
      })

      return request('get', `${issuesApi}?${queryStringify(query)}`, null, {
        Accept: `application/vnd.github.v3.${type}+json`
      }).then(data => data.map(item => {
        return formatPost(item, page)
      }));
    },

    // 通过标签获取issue
    getIssueByLabel(labels, type = 'full') {
      if (labelsMap.has(labels)) {
        return Promise.resolve(labelsMap.get(labels))
      }

      const query = Object.assign({}, baseQuery, {
        labels: labels,
        t: (new Date).getTime()
      })

      return request('get', `${issuesApi}?${queryStringify(query)}`, null, {
        Accept: `application/vnd.github.v3.${type}+json`
      }).then(data => data.map(item => {
        return formatPost(item, null, labels)
      }));
    },

    // 通过id获取issues
    getIssueById(id, type = 'full') {
      id = Number(id);
      if (idMap.has(id)) {
        return Promise.resolve(idMap.get(id)[0])
      }

      const query = Object.assign({}, baseQuery, {
        t: (new Date).getTime()
      })

      return request('get', `${issuesApi}/${id}?${queryStringify(query)}`, null, {
        Accept: `application/vnd.github.v3.${type}+json`
      }).then(data => formatPost(data));
    }
  }
}

export default creatApi();
