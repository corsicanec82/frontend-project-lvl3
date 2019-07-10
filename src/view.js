export const createArticle = (article) => {
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

export const createArticlesList = (id) => {
  const list = document.createElement('ul');
  list.id = id;
  list.className = 'list-group';

  return list;
};

export const addArticlesToList = (articles, list) => {
  const listItems = articles.map(createArticle);
  list.prepend(...listItems);
};

export const createModal = () => {
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'modalCenter';
  modal.tabIndex = '-1';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-labelledby', 'exampleModalCenterTitle');
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = [
    '<div class="modal-dialog modal-dialog-centered" role="document">',
    '<div class="modal-content">',
    '<div class="modal-header"><h5 class="modal-title"></h5></div>',
    '<div class="modal-body"></div>',
    '<div class="modal-footer">',
    '<button class="btn btn-secondary" data-dismiss="modal">Close</button>',
    '</div>',
    '</div>',
    '</div>',
  ].join('');

  document.body.prepend(modal);
};

export const createAlert = () => {
  const alert = document.createElement('div');
  alert.setAttribute('role', 'alert');
  alert.className = 'alert alert-danger d-none';

  document.getElementById('inputRSS').before(alert);

  return alert;
};

export const createFeed = (title, description, articlesToAdd, url) => {
  const list = createArticlesList(url);
  addArticlesToList(articlesToAdd, list);

  const feed = document.createElement('div');
  feed.className = 'jumbotron';
  feed.innerHTML = `<h3>${title}</h3><p>${description}</p>`;
  feed.append(list);

  document.querySelector('.container div').after(feed);
};

export const updateFeed = (articlesToAdd, url) => {
  const list = document.getElementById(url);
  addArticlesToList(articlesToAdd, list);
};

export const showProcessing = (button) => {
  const el = button;
  el.disabled = true;
  el.innerHTML = [
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>',
    ' Loading...',
  ].join('');
};

export const hideProcessing = (button) => {
  const el = button;
  el.disabled = false;
  el.innerHTML = 'Add Feed';
};

export const showAlert = (alert, text) => {
  const el = alert;
  el.textContent = text;
  el.classList.remove('d-none');
};

export const hideAlert = (alert) => {
  const el = alert;
  el.classList.add('d-none');
};
