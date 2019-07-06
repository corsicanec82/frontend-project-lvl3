import isURL from 'validator/lib/isURL';
import { watch } from 'melanke-watchjs';
import _some from 'lodash/some';
import getFeedData from './connector';
import * as view from './view';

export default () => {
  const state = {
    validURL: null,
    feeds: new Map(),
    query: {
      state: null,
      result: null,
    },
  };

  view.createModal();
  const alert = view.createAlert();
  const spinner = view.createSpinner();

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

  watch(state.query, 'state', () => {
    switch (state.query.state) {
      case 'processing':
        addFeed.disabled = true;
        addFeed.innerHTML = ' Loading...';
        addFeed.prepend(spinner);
        break;
      case 'backgroundProcessing':
        break;
      case 'failed':
        alert.textContent = state.query.result;
        inputRSS.before(alert);
        addFeed.disabled = false;
        addFeed.innerHTML = 'Add Feed';
        break;
      case 'backgroundFiled':
        break;
      case 'finished': {
        const { url, data, articlesToAdd } = state.query.result;
        const feed = view.createFeed(data.title, data.description);
        const list = view.createArticlesList(url);
        view.addArticlesToList(articlesToAdd, list);
        feed.append(list);
        container.after(feed);
        inputRSS.value = '';
        alert.remove();
        addFeed.disabled = false;
        addFeed.innerHTML = 'Add Feed';
        break;
      }
      case 'backgroundFinished': {
        const { url, articlesToAdd } = state.query.result;
        const list = document.getElementById(url);
        view.addArticlesToList(articlesToAdd, list);
        break;
      }
      default:
        throw new RangeError('(state.query.state): Invalid value.');
    }
  });

  const inputRSSKeyupHandler = (e) => {
    const url = e.target.value;
    state.validURL = isURL(url) && !state.feeds.has(url);
  };

  const changeQueryData = (url, error, data) => {
    const addNewFeed = !state.feeds.has(url);
    if (error !== null) {
      state.query.result = error;
      state.query.state = addNewFeed ? 'failed' : 'backgroundFiled';
      return;
    }
    const result = { url, data };
    if (addNewFeed) {
      result.articlesToAdd = data.articles;
    } else {
      const feedData = state.feeds.get(url);
      result.articlesToAdd = data.articles.filter(article => !_some(feedData.articles, article));
    }
    state.query.result = result;
    state.feeds.set(url, data);
    state.query.state = addNewFeed ? 'finished' : 'backgroundFinished';
    setTimeout(() => {
      state.query.state = 'backgroundProcessing';
      getFeedData(url, changeQueryData);
    }, 5000);
  };

  const addFeedClickHandler = (e) => {
    e.preventDefault();
    const url = inputRSS.value;
    if (!state.validURL) {
      state.query.result = 'Invalid link or feed already added.';
      state.query.state = 'failed';
      return;
    }
    state.query.state = 'processing';
    getFeedData(url, changeQueryData);
  };

  inputRSS.addEventListener('keyup', inputRSSKeyupHandler);
  addFeed.addEventListener('click', addFeedClickHandler);
};
