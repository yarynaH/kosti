# Kosti RPG app

Application for the [kosti website](http://www.kostirpg.com/).

## Installation

### Backend

This app uses Enonic XP. To install it, you need to have Java 11. Note, it will not work with any other Java version.

Development environment is set via Enonic CLI. You can download it [here](https://developer.enonic.com/start). After it is installed, create a new sandbox with `enonic sandbox create`. To start a sandbox in dev, run `enonic sandbox start --dev`.

To install the app, open app folder and run `enonic project deploy --dev`. This will run the app in dev mode. Note, sandbox should be running.

### Frontend

To make the app work properly, you need to have [node.js 14.2.\*](https://nodejs.org/en/), [gulp](https://gulpjs.com/) and [yarn](https://yarnpkg.com/) installed.
To install all the required packages run `yarn install`. When the installation is done, run `gulp watch --dev`.
