export default (xml) => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(xml, 'application/xml');

  if (dom.querySelector('parsererror') !== null) {
    throw new Error('The received data is not in xml format');
  }

  const title = dom.querySelector('channel title').textContent;
  const description = dom.querySelector('channel description').textContent;
  const articles = [...dom.querySelectorAll('item')]
    .map(node => ({
      title: node.querySelector('title').textContent,
      description: node.querySelector('description').textContent,
      link: node.querySelector('link').textContent,
    }));

  return { title, description, articles };
};
