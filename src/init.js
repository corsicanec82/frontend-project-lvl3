export default () => {
  const form = document.querySelector('div.jumbotron form');
  const p = document.createElement('p');
  p.textContent = 'description for jumbotron';
  form.before(p);
};
