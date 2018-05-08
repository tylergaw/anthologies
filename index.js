"use strict";

const fs = require("fs");
const handlebars = require("handlebars");
const BASE_TMPL = "./templates/base.html";
// TODO: env config
const ASSET_URL = "https://s3.amazonaws.com/anthologies-assets.dev/";

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

// TODO: Join. Instead of storing each article's details in the Entry, store
// it in a separate table. That way we can reuse already parsed / corrected
// articles.
const Articles = {
  "1": {
    title: "The Silent Season of a Hero",
    authors: [1, 3],
    publication: 1,
    url: "http://www.randomhouse.com/kvpa/talese/essays/dimaggio.html",
    description: "The complicated post-baseball days of Joe DiMaggio.",
    image: "a1-1.jpg"
  }
}

const Entries = {
  "1": {
    id: "1",
    title: "The Silent Season of a Hero",
    article: 1,
    authors: [1, 3],
    publication: 1,
    url: "http://www.randomhouse.com/kvpa/talese/essays/dimaggio.html",
    description: "The complicated post-baseball days of Joe DiMaggio.",
    image: "a1-1.jpg"
  },
  "2": {
    id: "2",
    title: "Allen Iverson, NBA Icon, Struggles with Life after Basketball",
    authors: [2],
    publication: 2,
    url: "https://www.washingtonpost.com/sports/wizards/allen-iverson-nba-icon-struggles-with-life-after-basketball/2013/04/19/bfd108f8-a76e-11e2-a8e2-5b98cb59187f_story.html",
    description: "The former NBA superstar is coping with life after basketball — and finding the adjustment difficult.",
    image: "a2-1.jpg"
  },
  "3": {
    id: "3",
    title: "How (and Why) Athletes Go Broke",
    authors: [3],
    publication: 3,
    url: "https://www.si.com/vault/2009/03/23/105789480/how-and-why-athletes-go-broke",
    description: "Recession or no recession, many NFL, NBA and Major League Baseball players have a penchant for losing most or all of their money. It doesn't matter how much they make. And the ways they blow it are strikingly similar",
    image: null
  },
  "4": {
    id: "4",
    title: "Terrell Owens, NFL Wide Receiver - GQ February 2012",
    authors: [4],
    publication: 4,
    url: "https://www.gq.com/story/terrell-owens-nfl-football-wide-receiver",
    description: "As you're planning your Super Bowl party this year, give a thought to future Hall of Famer Terrell Owens. He's out of work, out of money, and currently in court with all four of his baby mamas. And now for the part that really depresses him: For the first time in his long, checkered, and spectacular career, nobody wants to throw him the ball.",
    image: null
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
    curators: ["1"],
    image: "a1-1.jpg"
  },
  "456": { id: "456", title: "Anthology Title 2" },
  "789": { id: "789", title: "Anthology Title 3" },
  "012": { id: "012", title: "Anthology Title 4" }
};

const anthologyTmpl = `
  <div class="ant ant--spartan">
    <header class="ant__cover {{#if image}}ant__cover--w-image{{/if}}">
      {{#if image}}
      <img class="cover__img" src="{{assetUrl}}{{image}}" alt="">
      {{/if}}
      <div class="cover__body">
        <h1 class="ant__title">{{title}}</h1>
        <h3 class="ant__byline">
          <span class="text--subtle">Curated by</span> <a href="/u/{{user.id}}">{{user.name}}</a>
        </h3>
        <p class="ant__description">{{description}}</p>
      </div>
    </header>
    <ul class="ant__entries">
    {{#each entries}}
      <li class="entry {{#if image}}entry--w-image{{/if}}">
        <span class="text--subtle">{{#each authors}}{{#unless @first}}, {{/unless}}{{name}}{{/each}}</span>
        • {{#publication}}<strong>{{name}}</strong>{{/publication}}

        <a class="entry__link" href="{{url}}" target="_blank" rel="noopener">
          <h2 class="entry__title">{{title}}</h2>
          {{#description}}
          <p class="entry__desc">
            {{this}}
          </p>
          {{/description}}
        </a>

        {{#if image}}
        <img src="{{assetUrl}}{{image}}" alt="">
        {{/if}}
      </li>
    {{else}}
      <li>No entries</li>
    {{/each}}
    </ul>
    <div class="branding">
      <a href="/">anthologies</a>
    </div>
  </div>
`;

const Anthology = a => {
  const { curators, entries, title, description, image } = a;

  return {
    title,
    contents: handlebars.compile(anthologyTmpl)({
      title,
      description,
      image,
      assetUrl: ASSET_URL,
      entries: entries.map(entryId => {
        const { id, image, description, url, title, authors, publication } = Entries[entryId];

        return {
          assetUrl: ASSET_URL,
          id,
          image,
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
