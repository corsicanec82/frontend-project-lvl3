import { isURL } from 'validator';
import { watch } from 'melanke-watchjs';
import axios from 'axios';
import parse from './parser';
import * as Elements from './elements';

const corsProxy = 'https://cors-anywhere.herokuapp.com/';

export default () => {
  const state = {
    isValidURL: null,
    addedFeedsURL: [],
    isQuery: false,
    addButton: null,
    response: {
      data: null,
      result: null,
    },
  };

  Elements.createModal();
  const alert = Elements.createAlert();
  const spinner = Elements.createSpinner();

  const inputRSS = document.getElementById('inputRSS');
  const form = inputRSS.closest('form');
  const addFeed = form.querySelector('button');
  const container = form.closest('div');

  watch(state, 'isValidURL', () => {
    if (state.isValidURL) {
      inputRSS.classList.remove('is-invalid');
      return;
    }
    inputRSS.classList.add('is-invalid');
  });

  watch(state, 'isQuery', () => {
    if (state.isQuery) {
      state.addButton.disabled = true;
      state.addButton.innerHTML = ' Loading...';
      state.addButton.prepend(spinner);
      return;
    }
    state.addButton.disabled = false;
    state.addButton.innerHTML = 'Add Feed';
  });

  watch(state.response, 'result', () => {
    if (state.response.result === null) {
      return;
    }

    if (state.response.result !== 'success') {
      alert.textContent = state.response.result;
      inputRSS.before(alert);
      return;
    }

    state.response.result = null;
    inputRSS.value = '';
    alert.remove();

    const { title, description, articles } = state.response.data;
    const feed = Elements.createFeedElement(title, description);
    if (articles.length !== 0) {
      feed.append(Elements.createArticlesList(articles));
    }
    container.after(feed);
  });

  const inputRSSKeyupHandler = (e) => {
    const { value } = e.target;
    state.isValidURL = isURL(value) && !state.addedFeedsURL.includes(value);
  };

  const addFeedClickHandler = (e) => {
    const url = inputRSS.value;
    if (!state.isValidURL) {
      state.response.result = 'Invalid link or feed already added.';
      return;
    }
    state.isQuery = true;
    state.addButton = e.target;
    axios(`${corsProxy}${url}`)
      .then((response) => {
        const parseResult = parse(response.data);
        if (!parseResult) {
          state.response.result = 'The resulting data is not the appropriate format.';
          return;
        }
        state.response.data = parseResult;
        state.addedFeedsURL.push(url);
        state.response.result = 'success';
      })
      .catch((error) => {
        if (error.response) {
          state.response.result = 'RSS server responded with an error.';
        } else if (error.request) {
          state.response.result = 'The specified address is not available.';
        } else {
          state.response.result = 'Unknown error. Contact the administrator.';
        }
      })
      .finally(() => {
        state.isQuery = false;
      });
  };

  form.onsubmit = () => false;
  inputRSS.addEventListener('keyup', inputRSSKeyupHandler);
  addFeed.addEventListener('click', addFeedClickHandler);
};
