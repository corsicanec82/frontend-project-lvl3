import { promises as fs } from 'fs';
import path from 'path';
import { html } from 'js-beautify';
import init from '../src/init';

const createDOM = (htmlContent) => {
  const dom = document.implementation.createHTMLDocument();
  dom.open();
  dom.write(htmlContent);
  dom.close();
  const htmlElement = dom.querySelector('html');
  document.documentElement.remove();
  document.append(htmlElement);
};

const getTree = () => html(document.documentElement.outerHTML);

describe('init testing', () => {
  beforeAll(() => {
    const pathToHtml = path.resolve(__dirname, '__fixtures__/index.html');
    return fs.readFile(pathToHtml, 'utf8').then(createDOM);
  });

  it('init', () => {
    init();
    expect(getTree()).toMatchSnapshot();
  });
});
