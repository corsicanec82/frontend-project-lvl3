import isURL from 'validator/lib/isURL';
import { watch } from 'melanke-watchjs';
import _some from 'lodash/some';
import getFeedData from './connector';
import * as View from './view';

export default () => {
  const state = {
    validURL: null,
    feeds: new Map(),
    query: {
      process: false,
      response: null,
      data: null,
    },
  };

  View.createModal();
  const alert = View.createAlert();
  const spinner = View.createSpinner();

  const inputRSS = document.querySelector('#inputRSS');
  const form = inputRSS.closest('form');
  const container = form.closest('div');
  const addFeed = form.querySelector('button');

  watch(state, 'validURL', () => {
    if (state.validURL) {
      inputRSS.classList.remove('is-invalid');
    } else {
      inputRSS.classList.add('is-invalid');
    }
  });

  watch(state.query, 'process', () => {
    if (state.query.process) {
      addFeed.disabled = true;
      addFeed.innerHTML = ' Loading...';
      addFeed.prepend(spinner);
    } else {
      addFeed.disabled = false;
      addFeed.innerHTML = 'Add Feed';
    }
  });

  watch(state.query, 'response', () => {
    if (state.query.response === null) {
      return;
    }
    if (state.query.response === 'success') {
      inputRSS.value = '';
      alert.remove();
    } else {
      alert.textContent = state.query.response;
      inputRSS.before(alert);
    }
  });

  watch(state.query, 'data', () => {
    let list;
    let articlesToAdd;
    const { url, data: updatedData } = state.query.data;
    if (!state.feeds.has(url)) {
      articlesToAdd = updatedData.articles;
      const feed = View.createFeed(updatedData.title, updatedData.description);
      list = View.createArticlesList();
      feed.append(list);
      container.after(feed);
    } else {
      const feedData = state.feeds.get(url);
      list = feedData.articlesList;
      articlesToAdd = updatedData.articles.filter(article => !_some(feedData.articles, article));
    }
    View.addArticlesToList(articlesToAdd, list);
    state.feeds.set(url, { ...updatedData, articlesList: list });
  });

  const inputRSSKeyupHandler = (e) => {
    const url = e.target.value;
    state.validURL = isURL(url) && !state.feeds.has(url);
  };

  const changeQueryData = (url, error, data) => {
    if (error !== null) {
      return;
    }
    state.query.data = { url, data };
    setTimeout(getFeedData, 5000, url, changeQueryData);
  };

  const addFeedClickHandler = () => {
    state.query.response = null;
    const url = inputRSS.value;
    if (!state.validURL) {
      state.query.response = 'Invalid link or feed already added.';
      return;
    }
    state.query.process = true;
    getFeedData(url, changeQueryData, (error) => {
      state.query.process = false;
      state.query.response = error === null ? 'success' : error;
    });
  };

  form.onsubmit = () => false;
  inputRSS.addEventListener('keyup', inputRSSKeyupHandler);
  addFeed.addEventListener('click', addFeedClickHandler);
};
