import { isURL } from 'validator';
import { watch } from 'melanke-watchjs';
import axios from 'axios';

const corsProxy = 'https://cors-anywhere.herokuapp.com/';

export default () => {
  const state = {
    isValidURL: null,
    addedFeedsURL: [],
    response: {
      data: null,
      result: null,
    },
  };

  const inputRSSEl = document.getElementById('inputRSS');
  const formEl = inputRSSEl.closest('form');
  const addFeedEl = formEl.querySelector('button');
  const containerEl = formEl.closest('div');

  const messageEl = document.createElement('div');
  messageEl.setAttribute('role', 'alert');
  messageEl.className = 'alert alert-danger';

  const spanButtonEl = document.createElement('span');
  spanButtonEl.className = 'spinner-border spinner-border-sm';
  spanButtonEl.setAttribute('role', 'status');
  spanButtonEl.setAttribute('aria-hidden', 'true');
  const textButtonEl = document.createTextNode(' Loading...');

  watch(state, 'isValidURL', () => {
    if (state.isValidURL) {
      inputRSSEl.classList.remove('is-invalid');
    } else {
      inputRSSEl.classList.add('is-invalid');
    }
  });

  watch(state.response, 'result', () => {
    if (state.response.result === 'success') {
      state.response.result = null;
      inputRSSEl.value = '';
      messageEl.remove();

      const dom = state.response.data;
      const title = dom.querySelector('channel title');
      const description = dom.querySelector('channel description');

      const feedEl = document.createElement('div');
      feedEl.className = 'jumbotron';
      const headlineEl = document.createElement('h3');
      headlineEl.textContent = title.textContent;
      const descriptionEl = document.createElement('p');
      descriptionEl.textContent = description.textContent;

      feedEl.append(headlineEl, descriptionEl);
      containerEl.after(feedEl);

      const articles = [...dom.querySelectorAll('item')];
      if (articles.length !== 0) {
        const articlesEl = document.createElement('ul');
        articlesEl.className = 'list-group';
        const articlesMapped = articles.map((node) => {
          const articleEl = document.createElement('li');
          articleEl.className = 'list-group-item';
          const linkEl = document.createElement('a');
          linkEl.textContent = node.querySelector('title').textContent;
          linkEl.href = node.querySelector('link').textContent;
          linkEl.target = '_blank';
          articleEl.append(linkEl);
          return articleEl;
        });
        articlesEl.append(...articlesMapped);
        feedEl.append(articlesEl);
      }
    } else if (state.response.result !== null) {
      messageEl.textContent = state.response.result;
      inputRSSEl.before(messageEl);
    }
  });

  const inputRSSKeyupHandler = (e) => {
    const { value } = e.target;
    state.isValidURL = isURL(value) && !state.addedFeedsURL.includes(value);
  };

  const addFeedClickHandler = (e) => {
    const url = inputRSSEl.value;
    if (!state.isValidURL) {
      state.response.result = 'Invalid link or feed already added.';
      return;
    }
    e.target.disabled = true;
    e.target.innerHTML = '';
    e.target.append(spanButtonEl, textButtonEl);
    axios(`${corsProxy}${url}`)
      .then((response) => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(response.data, 'application/xml');
        if (dom.querySelector('parsererror') !== null) {
          state.response.result = 'The resulting data is not the appropriate format.';
          return;
        }
        state.response.data = dom;
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
        e.target.disabled = false;
        e.target.innerHTML = 'Add Feed';
      });
  };

  formEl.onsubmit = () => false;
  inputRSSEl.addEventListener('keyup', inputRSSKeyupHandler);
  addFeedEl.addEventListener('click', addFeedClickHandler);
};
