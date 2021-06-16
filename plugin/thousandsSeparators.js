module.exports = views => {
  return views.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ','); //千分位符號的表達式
};
