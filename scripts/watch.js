/* eslint-disable no-undef */
/* eslint-disable import/order */
const fse = require("fs-extra"); // fs-extra for easy directory copying
const fs = require("node:fs");
const path = require("path");

const buildDir = path.join(__dirname, "../build");
const releaseDir = path.join(
  buildDir,
  // eslint-disable-next-line require-unicode-regexp
  `Release`
);

// Ensure build directory exists
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir);
}

// Clear and recreate specific release directory
fse.emptyDirSync(releaseDir);

// Copy necessary directories and files to the release directory
fse.copySync("src/", path.join(releaseDir, "src"));
fse.copySync("lib/", path.join(releaseDir, "lib"));
fse.copySync("images/", path.join(releaseDir, "images"));
fse.copyFileSync("manifest.json", path.join(releaseDir, "manifest.json"));
fse.copyFileSync("background.js", path.join(releaseDir, "background.js"));
fse.copyFileSync("contentScript.js", path.join(releaseDir, "contentScript.js"));
fse.copyFileSync("LICENSE", path.join(releaseDir, "LICENSE"));
const sourcePath = path.join(__dirname, "../config/secrets.production.js");

const destinationDir = path.join(releaseDir, "config");
if (!fs.existsSync(destinationDir)) {
  fs.mkdirSync(destinationDir, { recursive: true });
}

const destinationPath = path.join(destinationDir, "secrets.js");
fse.copyFileSync(sourcePath, destinationPath);
