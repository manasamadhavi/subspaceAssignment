const express = require('express');
const request = require('request');
const _ = require('lodash');

const app = express();

// middleware function to make cURL request
function makeCurlRequest(req, res, next) {
  const url = 'https://intent-kit-16.hasura.app/api/rest/blogs';

  // cURL request options
  const requestOptions = {
    url: url,
    method: 'GET',
    headers: {
      'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6', // Replace with your User-Agent header
    },
  };

  // cURL request using the 'request' library
  request(requestOptions, (error, response, body) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    req.apiResponseData = JSON.parse(body);
    const blogsArray = req.apiResponseData.blogs;
    const query = req.query.q; 
    //console.log(query)
    const searchResults = _.filter(blogsArray, (blog) =>
  _.includes(_.toLower(blog.title), _.toLower(query))
    );
    req.searchResults=searchResults


  const totalBlogs = _.size(blogsArray);

  const blogWithLongestTitle = _.maxBy(blogsArray, (blog) => _.get(blog, 'title.length', 0));

  const blogsWithWord = _.filter(blogsArray, (blog) =>
  _.includes(_.toLower(blog.title), _.toLower('privacy'))
    );

  const numberOfBlogsWithWord = blogsWithWord.length;

  const uniqueTitles = _.uniqBy(blogsArray, 'title').map(blog => blog.title);

  const finalJsonObj = {
      totalNumberOfBlogs: totalBlogs,
      blogWithLongestTitle: blogWithLongestTitle,
      numberOfBlogsWithWordPrivacyInTitle: numberOfBlogsWithWord,
      arrayOfUniqueBlogTitles: uniqueTitles,
    };

    req.finalJsonObj = finalJsonObj

    next();
  });
  }

var cachedMakeCurlRequest =_.memoize(makeCurlRequest);
setTimeout(() => {
  console.log(cachedMakeCurlRequest);//recompute result after 1 min
}, 61 * 1000);

app.get('/api/blog-search', cachedMakeCurlRequest, (req, res) => {
    res.send(req.searchResults);
});

app.get('/api/blog-stats', cachedMakeCurlRequest, (req, res) => {
    res.send(req.finalJsonObj)
});



app.listen(5000, () => {
    console.log('Server is listening on port 5000');
  });

