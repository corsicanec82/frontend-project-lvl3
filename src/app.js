import isURL from 'validator/lib/isURL';
import { watch } from 'melanke-watchjs';
import _some from 'lodash/some';
import _has from 'lodash/has';
import axios from 'axios';
import parse from './parser';
import View from './view';

const getFeedData = (url, validUrl = true) => {
  if (!validUrl) {
    return Promise.reject(new Error('Invalid link or feed already added'));
  }
  return axios(`https://cors-anywhere.herokuapp.com/${url}`).then(response => parse(response.data));
};

export default () => {
  const state = {
    validUrl: null,
    feeds: {},
    diffs: {},
    query: {
      state: null,
      response: null,
    },
  };

  const view = new View();

  watch(state, 'validUrl', () => {
    view.setInvalidInput(!state.validUrl);
  });

  watch(state.query, 'state', () => {
    switch (state.query.state) {
      case 'processing':
        view.showProcessing();
        break;
      case 'finished': {
        const { url, data } = state.query.response;
        View.createFeed(data.title, data.description, data.articles, url);
        view.hideAlert();
        view.clearInput();
        view.hideProcessing();
        break;
      }
      case 'filed':
        view.showAlert(state.query.response);
        view.clearInput();
        view.hideProcessing();
        break;
      default:
        throw new RangeError('(state.query.state): Invalid value.');
    }
  });

  watch(state.diffs, (url, action) => {
    if (action !== 'set') {
      return;
    }
    View.updateFeed(url, state.diffs[url]);
  }, 0, true);

  const inputUrlKeyUpHandler = ({ target: { value } }) => {
    state.validUrl = isURL(value) && !_has(state.feeds, value);
  };

  const updateFeed = (url) => {
    setTimeout(() => {
      getFeedData(url).then((data) => {
        const diffs = data.articles.filter((item) => {
          const article = { title: item.title, description: item.description };
          return !_some(state.feeds[url].articles, article);
        });
        if (diffs.length !== 0) {
          state.diffs[url] = diffs;
          state.feeds[url] = data;
        }
      }).finally(() => {
        updateFeed(url);
      });
    }, 5000);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('inputUrl');
    state.query.state = 'processing';
    getFeedData(url, state.validUrl)
      .then((data) => {
        state.feeds[url] = data;
        state.diffs[url] = null;
        state.query.response = { url, data };
        state.query.state = 'finished';
        updateFeed(url);
      })
      .catch((error) => {
        state.query.response = error.message;
        state.query.state = 'filed';
      });
  };

  view.inputUrl.addEventListener('keyup', inputUrlKeyUpHandler);
  view.form.addEventListener('submit', submitHandler);
};
