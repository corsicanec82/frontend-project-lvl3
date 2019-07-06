import axios from 'axios';
import parse from './parser';

const corsProxy = 'https://cors-anywhere.herokuapp.com/';

export default (url, cb) => {
  const result = {
    error: null,
    data: null,
  };

  axios(`${corsProxy}${url}`)
    .then((response) => {
      const parseResult = parse(response.data);
      if (!parseResult) {
        result.error = 'The resulting data is not the appropriate format.';
      } else {
        result.data = parseResult;
      }
    })
    .catch((error) => {
      if (error.response) {
        result.error = 'RSS server responded with an error.';
      } else if (error.request) {
        result.error = 'The specified address is not available.';
      } else {
        result.error = 'Unknown error. Contact the administrator.';
      }
    })
    .finally(() => {
      cb(url, result.error, result.data);
    });
};
