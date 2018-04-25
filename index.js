"use strict";

const fs = require("fs");
const handlebars = require("handlebars");
const BASE_TMPL = "./templates/base.html";

const isLocal = process.env.AWS_SAM_LOCAL;
const statusKey = isLocal ? "statusCode" : "status";
const headers = isLocal ? {
  "content-type": "text/html"
} : {
  "content-type": [{ key: "Content-Type", value: "text/html" }]
};

const anthologyIndex = ["123", "456", "789", "012"];
const anthologies = {
  "123": { id: "123", title: "The Longform Guide to Sad Retired Athletes" },
  "456": { id: "456", title: "Anthology Title 2" },
  "789": { id: "789", title: "Anthology Title 3" },
  "012": { id: "012", title: "Anthology Title 4" }
};

exports.handler = (event, context, callback) => {
  const requestUri = isLocal
    ? event.requestContext.resourcePath
    : event.Records[0].cf.request.uri;

  fs.readFile(BASE_TMPL, "utf8", (err, data) => {
    try {
      const id = requestUri.split("/a/")[1];
      const index = anthologyIndex.indexOf(id);
      const notFound = index < 0;
      const title = notFound ? "Not Found" : anthologies[id].title;
      const contents = notFound
        ? `<h1>404: Item with Id ${id} ${title}</h1>`
        : `<h1>${title}</h1>`;

      callback(null, {
        [statusKey]: notFound ? "404" : "200",
        headers,
        body: handlebars.compile(data)({title, contents})
      });
    } catch (err) {
      callback(null, {
        [statusKey]: 500,
        headers,
        body: handlebars.compile(data)({contents: err})
      });
    }
  });
};
