export const createFeed = (title, description) => {
  const headline = document.createElement('h3');
  headline.textContent = title;

  const content = document.createElement('p');
  content.textContent = description;

  const feed = document.createElement('div');
  feed.className = 'jumbotron';
  feed.append(headline, description);

  return feed;
};

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
  const headline = document.createElement('h5');
  headline.className = 'modal-title';

  const divHeader = document.createElement('div');
  divHeader.className = 'modal-header';
  divHeader.append(headline);

  const divBody = document.createElement('div');
  divBody.className = 'modal-body';

  const buttonClose = document.createElement('button');
  buttonClose.className = 'btn btn-secondary';
  buttonClose.setAttribute('data-dismiss', 'modal');
  buttonClose.textContent = 'Close';

  const divFooter = document.createElement('div');
  divFooter.className = 'modal-footer';
  divFooter.append(buttonClose);

  const divContent = document.createElement('div');
  divContent.className = 'modal-content';
  divContent.append(divHeader, divBody, divFooter);

  const divDocument = document.createElement('div');
  divDocument.className = 'modal-dialog modal-dialog-centered';
  divDocument.setAttribute('role', 'document');
  divDocument.append(divContent);

  const divModal = document.createElement('div');
  divModal.className = 'modal fade';
  divModal.id = 'modalCenter';
  divModal.tabIndex = '-1';
  divModal.setAttribute('role', 'dialog');
  divModal.setAttribute('aria-labelledby', 'exampleModalCenterTitle');
  divModal.setAttribute('aria-hidden', 'true');
  divModal.append(divDocument);

  document.body.prepend(divModal);
};

export const createAlert = () => {
  const alert = document.createElement('div');
  alert.setAttribute('role', 'alert');
  alert.className = 'alert alert-danger';

  return alert;
};

export const createSpinner = () => {
  const spinner = document.createElement('span');
  spinner.className = 'spinner-border spinner-border-sm';
  spinner.setAttribute('role', 'status');
  spinner.setAttribute('aria-hidden', 'true');

  return spinner;
};
