import {Workbox} from 'workbox-window';

function wb() {
  let workbox;
  if ('serviceWorker' in navigator) {
    workbox = new Workbox(`${process.env.BASE_URL}service-worker.js`);
    workbox.addEventListener('controlling', () => {
      window.location.reload();
    });
    workbox.register();
  }
  return workbox;
}

export default wb();
