# Kosti RPG app
Application for the [kosti website](http://www.kostirpg.com/).

## Installation
This app uses Enonic XP. To install it, you need to have Java 8. Note, it will not work with Java 9.

You can download Enonic XP [here](https://enonic.com/downloads). After you did this, unzip it and go to `XP_FOLDER/bin` and start the file `server.sh` if you run Linux, or `server.bat` if you run Windows.

The Enonic server is starting. The detailed log you may find in `XP_FOLDER/home/logs`.

To install this app, you need to go to `KOSTIRPG_FOLDER/app` and execute `bash gradlew build` for Linux users, or execute `gradlew.bat` for Windows users. The application will be built and you may find it at `KOSTIRPG_FOLDER/app/build/libs`. To install it on the server, you need to copy the `jar` file to `XP_FOLDER/home/deploy`.

Now you have the basic kostirpg server and app installed.
