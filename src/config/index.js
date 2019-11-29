const path = require("path");
const wrap = require("./wrap");
const isProd = process.env.NODE_ENV === "production";

const config = {
  theme: "default",
  dev: {
    port: 3000,
    outputPath: path.join(process.cwd(), "./"),
    publicPath: isProd ? "https://e.yunc.me/" : "/"
  },
  website: {
    pageName(page){
      return page.replace('.html', '')
    },
    seo: {
      title: "无讼法苑",
      keywords: "分享，极致生活！！！",
      description: "chunxiaqiu13@gmail.com",
      copyright: '© 2018 All Rights Reserved.'
    },
    post: {
      excerpt: 120,
      pageSize: 5
    },
    github: {
      clientID: "7eade918eada70a8fe24",
      clientSecret: "9c322cdfe9ad8cc18768090c5e26f139f868a50b",
      repo: "elaw",
      owner: "fydy",
      admin: ["fydy"]
    },
    plugins: {
      loading: "#000",
      baidutongji: "2c2210ecbbefc4311db6c80bc8a19577"
    },
    menus: [
      {
        name: "首页",
        link: "/"
      },
      {
        name: "留言",
        link: "/message.html"
      }
    ]
  }
};

module.exports = wrap(config);
