"use strict";

const fs = require("fs");
const handlebars = require("handlebars");
const BASE_TMPL = "./templates/base.html";

const isLocal = process.env.AWS_SAM_LOCAL;
const statusKey = isLocal ? "statusCode" : "status";
const headers = isLocal
  ? {
      "content-type": "text/html"
    }
  : {
      "content-type": [{ key: "Content-Type", value: "text/html" }]
    };

const users = {
  "1": {
    id: "1",
    name: "Casey Jones"
  }
};

const Authors = {
  "1": {
    name: "Gay Talese"
  },
  "2": {
    name: "Kent Babb"
  },
  "3": {
    name: "Pablo S. Torre"
  },
  "4": {
    name: "Nancy Hass"
  }
};

const Publications = {
  "1": {
    name: "Esquire"
  },
  "2": {
    name: "Washington Post"
  },
  "3": {
    name: "Sports Illustrated"
  },
  "4": {
    name: "GQ"
  }
};

const Entries = {
  "1": {
    id: "1",
    title: "The Silent Season of a Hero",
    authors: [1, 3],
    publication: 1,
    url: "http://www.randomhouse.com/kvpa/talese/essays/dimaggio.html",
    description: "The complicated post-baseball days of Joe DiMaggio."
  },
  "2": {
    id: "2",
    title: "Allen Iverson, NBA Icon, Struggles with Life after Basketball",
    authors: [2],
    publication: 2,
    url: "https://www.washingtonpost.com/sports/wizards/allen-iverson-nba-icon-struggles-with-life-after-basketball/2013/04/19/bfd108f8-a76e-11e2-a8e2-5b98cb59187f_story.html",
    description: "Basketball’s iconoclast is now a broke recluse at 37."
  },
  "3": {
    id: "3",
    title: "How (and Why) Athletes Go Broke",
    authors: [3],
    publication: 3,
    url: "https://www.si.com/vault/2009/03/23/105789480/how-and-why-athletes-go-broke",
    description: "Five years after they leave the league, 60 percent of NBA players have nothing left. In the NFL, it’s closer to 80 percent after just two years. A breakdown of the economics of retirement."
  },
  "4": {
    id: "4",
    title: "Love Me, Hate Me, Just Don’t Ignore Me",
    authors: [4],
    publication: 4,
    url: "https://www.gq.com/story/terrell-owens-nfl-football-wide-receiver",
    description: "Terrell Owens at 38: unemployed, nearly bankrupt after losing his shirt in a electronic-bingo entertainment complex development plan gone bust, father of four children (one of which he has never met), frequent bowler."
  }
};

const anthologyIndex = ["123", "456", "789", "012"];
const anthologies = {
  "123": {
    id: "123",
    title: "The Longform Guide to Sad Retired Athletes",
    description:
      "Iverson, Canseco, TO, and DiMaggio — a collection of picks on post-career woe. I think the average description will be longer than what was here before. Maybe about long tweet size at 280 characters?",
    entries: ["1", "2", "3", "4"],
    curators: ["1"]
  },
  "456": { id: "456", title: "Anthology Title 2" },
  "789": { id: "789", title: "Anthology Title 3" },
  "012": { id: "012", title: "Anthology Title 4" }
};

const anthologyTmpl = `
  <h1>{{title}}</h1>
  <h3>Curated by <a href="/u/{{user.id}}">{{user.name}}</a></h3>
  <p>{{description}}</p>
  <ul>
  {{#each entries}}
    <li>
      {{#each authors}}{{#unless @first}}, {{/unless}}{{name}}{{/each}}
      • {{#publication}}<strong>{{name}}</strong>{{/publication}}

      <a href="{{url}}" target="_blank" rel="noopener">
        <h2>{{title}}</h2>
        {{#description}}
        <p>
          {{this}}
        </p>
        {{/description}}
      </a>
    </li>
  {{else}}
    <li>No entries</li>
  {{/each}}
  </ul>
`;

const Anthology = a => {
  const { curators, entries, title, description } = a;

  return {
    title,
    contents: handlebars.compile(anthologyTmpl)({
      title,
      description,
      entries: entries.map(entryId => {
        const { id, description, url, title, authors, publication } = Entries[entryId];

        return {
          id,
          title,
          url,
          description,
          authors: authors.map(authorId => Authors[authorId]),
          publication: Publications[publication]
        }
      }),
      user: users[curators[0]]
    })
  };
};

const NotFound = () => ({
  title: "Not Found",
  contents: "<h1>404 Anthology Not found</h1>"
});

exports.handler = (event, context, callback) => {
  const requestUri = isLocal
    ? event.requestContext.resourcePath
    : event.Records[0].cf.request.uri;

  fs.readFile(BASE_TMPL, "utf8", (err, data) => {
    try {
      const id = requestUri.split("/a/")[1];
      const index = anthologyIndex.indexOf(id);
      const notFound = index < 0;
      const { title, contents } = notFound
        ? NotFound()
        : Anthology(anthologies[id]);

      callback(null, {
        [statusKey]: notFound ? "404" : "200",
        headers,
        body: handlebars.compile(data)({ title, contents })
      });
    } catch (err) {
      callback(null, {
        [statusKey]: 500,
        headers,
        body: handlebars.compile(data)({ contents: err })
      });
    }
  });
};
