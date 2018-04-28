// 3rd-party dependencies
const gulp = require("gulp");
const postcss = require("gulp-postcss");
const postcssImport = require("postcss-import");
const del = require("del");
const handlebars = require("handlebars");

// Standard modules
const Transform = require("stream").Transform;
const fs = require("fs");
const path = require("path");

const BASE_TMPL = "./templates/base.html";

const templates = () => {
  const transformStream = new Transform({objectMode: true});
  transformStream._transform = (file, encoding, callback) => {
    const error = null;

    fs.readFile(BASE_TMPL, "utf8", (err, tmplData) => {
      callback(error, (f => {
        const filename = path.basename(f.path, ".html");
        const newContents = handlebars.compile(tmplData)({
          htmlClass: `page-${filename}`,
          contents: f.contents.toString("utf8")
        });

        let newFile = f.clone();
        newFile.contents = Buffer.from(newContents);

        if (filename !== "index") {
          newFile.path = `${f.base}${filename}/index.html`;
        }

        return newFile;
      })(file));
    });
  };

  return transformStream;
};

gulp.task("clean", () => del(["./public/**/*"]));

gulp.task("html", () => {
  return gulp.src("./public-src/*.html")
    .pipe(templates())
    .pipe(gulp.dest("./public"));
});

gulp.task("css", () =>
  gulp
    .src("./public-src/css/*.css")
    .pipe(postcss([postcssImport()]))
    .pipe(gulp.dest("./public/css"))
);

gulp.task("default", ["clean", "html", "css"]);
