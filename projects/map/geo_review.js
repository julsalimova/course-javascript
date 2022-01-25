import InteractiveMap from './interactiveMap';

export default class GeoReview {
  constructor() {
    this.FormReview = document.querySelector('#addFormReview').innerHTML;
    this.map = new InteractiveMap('map', this.onClick.bind(this));
    this.map.init().then(this.onInit.bind(this));
  }

  async onInit() {
    this.paintPlacemarks();
    document.body.addEventListener('click', this.onDocumentClick.bind(this));
  }

  paintPlacemarks() {
    const geoReview = this.getGeoReview();

    for (const item in geoReview) {
      geoReview[item].forEach((review) => {
        this.map.createPlacemark(JSON.parse(item));
      });
    }
  }

  createForm(coords, reviews) {
    const root = document.createElement('div');
    root.innerHTML = this.FormReview;
    const reviewForm = root.querySelector('[data-role=review-form]');
    reviewForm.dataset.coords = JSON.stringify(coords);

    const reviewList = root.querySelector('.review-list');

    for (const item of reviews) {
      const div = document.createElement('div');
      div.classList.add('review-item');
      div.innerHTML = `
  <div>
    <b>${item.name}</b> [${item.place}]
  </div>
  <div>${item.text}</div>
  `;
      reviewList.appendChild(div);
    }

    return root;
  }

  addReview(coords, review) {
    const geoReview = this.getGeoReview();
    const coordsAsString = JSON.stringify(coords);

    const reviews = geoReview[coordsAsString] ?? [];

    reviews.push(review);

    geoReview[coordsAsString] = reviews;
    localStorage.setItem('geoReview', JSON.stringify(geoReview));
  }

  getGeoReview() {
    const storageAsString = localStorage.getItem('geoReview') ?? '{}';
    return JSON.parse(storageAsString);
  }

  onClick(coords) {
    const geoReview = this.getGeoReview();
    const coordsAsString = JSON.stringify(coords);
    const reviews = geoReview[coordsAsString] ?? [];

    const form = this.createForm(coords, reviews);

    this.map.openBalloonContent(coords, form.innerHTML);
  }

  async onDocumentClick(e) {
    if (e.target.dataset.role === 'review-add') {
      const reviewForm = document.querySelector('[data-role=review-form]');
      const coords = JSON.parse(reviewForm.dataset.coords);
      const review = {
        name: document.querySelector('[data-role=review-name]').value,
        place: document.querySelector('[data-role=review-place]').value,
        text: document.querySelector('[data-role=review-text]').value,
      };

      this.addReview(coords, review);
      this.map.createPlacemark(coords);
      this.map.closeBalloon();
    }
  }
}
