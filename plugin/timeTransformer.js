module.exports = s => {
  let hr = Math.floor(s / 3600);
  let min = Math.floor((s - hr * 3600) / 60);
  let sec = parseInt(s - hr * 3600 - min * 60, 10);
  while (min.length < 2) {
    min = `0${min}`;
  }
  while (sec.length < 2) {
    sec = `0${min}`;
  }
  if (hr) hr += ':';
  return `${hr + min}:${sec}`;
};
