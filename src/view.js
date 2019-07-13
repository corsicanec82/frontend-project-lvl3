export default class View {
  constructor() {
    this.inputUrl = document.getElementById('inputUrl');
    this.form = this.inputUrl.closest('form');
    this.addFeedButton = this.form.querySelector('button');
    this.alert = this.form.querySelector('.alert');
  }

  setInvalidInput(force) {
    this.inputUrl.classList.toggle('is-invalid', force);
  }

  clearInput() {
    this.inputUrl.value = '';
  }

  showProcessing() {
    this.addFeedButton.disabled = true;
    this.addFeedButton.innerHTML = [
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>',
      ' Loading...',
    ].join('');
  }

  hideProcessing() {
    this.addFeedButton.disabled = false;
    this.addFeedButton.innerHTML = 'Add Feed';
  }

  showAlert(message) {
    this.alert.textContent = message;
    this.alert.classList.remove('d-none');
  }

  hideAlert() {
    this.alert.classList.add('d-none');
  }

  static addArticlesToList(list, articles) {
    const createArticle = (article) => {
      const link = document.createElement('a');
      link.textContent = article.title;
      link.href = article.link;
      link.target = '_blank';

      const showDescription = document.createElement('button');
      showDescription.type = 'button';
      showDescription.setAttribute('data-toggle', 'modal');
      showDescription.setAttribute('data-target', '#modalCenter');
      showDescription.className = 'btn btn-info btn-sm ml-3';
      showDescription.textContent = 'Show description';
      showDescription.addEventListener('click', (e) => {
        const modal = document.querySelector(e.target.dataset.target);
        modal.querySelector('.modal-title').textContent = article.title;
        modal.querySelector('.modal-body').textContent = article.description;
      });

      const item = document.createElement('li');
      item.className = 'list-group-item';
      item.append(link, showDescription);

      return item;
    };

    const listItems = articles.map(createArticle);
    list.prepend(...listItems);
  }

  static createFeed(title, description, articles, url) {
    const list = document.createElement('ul');
    list.id = url;
    list.className = 'list-group';
    this.addArticlesToList(list, articles);

    const feed = document.createElement('div');
    feed.className = 'jumbotron';
    feed.innerHTML = `<h3>${title}</h3><p>${description}</p>`;
    feed.append(list);

    document.querySelector('.container div').after(feed);
  }

  static updateFeed(url, articles) {
    const list = document.getElementById(url);
    this.addArticlesToList(list, articles);
  }
}
