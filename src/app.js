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
    backgroundQuery: {
      state: null,
      result: null,
    },
  };

  view.createModal();
  const alert = view.createAlert();
  const inputRSS = document.getElementById('inputRSS');
  const form = inputRSS.closest('form');
  const addFeedButton = form.querySelector('button');

  watch(state, 'validURL', () => {
    if (state.validURL) {
      inputRSS.classList.remove('is-invalid');
    } else {
      inputRSS.classList.add('is-invalid');
    }
  });

  watch(state.backgroundQuery, 'state', () => {
    switch (state.backgroundQuery.state) {
      case 'processing':
        break;
      case 'finished': {
        const { url, articles } = state.backgroundQuery.result;
        view.updateFeed(articles, url);
        break;
      }
      default:
        throw new RangeError('(state.backgroundQuery.state): Invalid value.');
    }
  });

  watch(state.query, 'state', () => {
    switch (state.query.state) {
      case 'processing':
        view.showProcessing(addFeedButton);
        break;
      case 'failed':
        view.showAlert(alert, state.query.result);
        view.hideProcessing(addFeedButton);
        break;
      case 'finished': {
        const { url, data } = state.query.result;
        view.createFeed(data.title, data.description, data.articles, url);
        inputRSS.value = '';
        view.hideAlert(alert);
        view.hideProcessing(addFeedButton);
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

  const updateFeed = (url, error, data) => {
    if (error !== null) {
      return;
    }
    const feedData = state.feeds.get(url);
    const articles = data.articles.filter(article => !_some(feedData.articles, article));
    state.backgroundQuery.result = { url, articles };
    state.feeds.set(url, data);
    state.backgroundQuery.state = 'finished';
    setTimeout(() => {
      state.backgroundQuery.state = 'processing';
      getFeedData(url, updateFeed);
    }, 5000);
  };

  const addFeed = (url, error, data) => {
    if (error !== null) {
      state.query.result = error;
      state.query.state = 'failed';
      return;
    }
    state.query.result = { url, data };
    state.feeds.set(url, data);
    state.query.state = 'finished';
    setTimeout(() => {
      state.backgroundQuery.state = 'processing';
      getFeedData(url, updateFeed);
    }, 5000);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const url = data.get('feedUrl');
    if (!state.validURL) {
      state.query.result = 'Invalid link or feed already added.';
      state.query.state = 'failed';
      return;
    }
    state.query.state = 'processing';
    getFeedData(url, addFeed);
  };

  inputRSS.addEventListener('keyup', inputRSSKeyupHandler);
  form.addEventListener('submit', submitHandler);
};
