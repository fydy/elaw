module.exports = function(config) {
  config.website.menus = config.website.menus
    .map(item => {
      return `<a class="menu-item" title="${item.name}" href="${item.link}">${item.name}</a>`;
    })
    .join('');

  config.path = `/src/theme/${config.theme}`;
  
  return config;
};
