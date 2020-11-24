## More postgres madness
This time, when I ran `psql postgres` or `sudo -u postgres psql`, I was getting this error: psql: error: could not connect to server: could not connect to server: No such file or directory
	Is the server running locally and accepting
	connections on Unix domain socket "/tmp/.s.PGSQL.5432"
To fix it this time, I followed Nelu's solution (which was a few down from the top solution on the SO post) on https://stackoverflow.com/questions/12472988/postgresql-error-could-not-connect-to-server-no-such-file-or-directory.
Solution had me update and upgrade brew, and upgrade postgres database (I think). These were the commands:
```
brew update
brew upgrade
brew postgresql-upgrade-database
```

### Setting up the database
Then, I could get into postgres with `psql postgres`.
1. I created a new database `tts` as my superuser, and then I allowed user01 access to the new database by running `grant all privileges on database tts to user01;`
2. Updated settings.py in top level project
   1. added the app `backend.apps.BackendConfig` to apps
   2. Also added `rest_framework`
3. Seeded the database with the data. Tried running `python upload_data.py`, but kept getting the following error:
   ```
   ❯ python upload_data.py                   
   Traceback (most recent call last):
     File "upload_data.py", line 2, in <module>
       from backend.models import TtsEntry
     File "/Users/lex/Documents/coding/python/hellometer-project/total_tts/backend/models.py", line 4, in <module>
       class TtsEntry(models.Model):
     File "/Users/lex/Documents/coding/python/hellometer-project/lib/python3.8/site-packages/django/db/models/base.py", line 108, in __new__
       app_config = apps.get_containing_app_config(module)
     File "/Users/lex/Documents/coding/python/hellometer-project/lib/python3.8/site-packages/django/apps/registry.py", line 253, in get_containing_app_config
       self.check_apps_ready()
     File "/Users/lex/Documents/coding/python/hellometer-project/lib/python3.8/site-packages/django/apps/registry.py", line 136, in check_apps_ready
       raise AppRegistryNotReady("Apps aren't loaded yet.")
   django.core.exceptions.AppRegistryNotReady: Apps aren't loaded yet.
    ```
    * Not sure what caused it, but when I copied and pasted it in the the shell (`python manage.py shell`), it worked.

to do aggregates when querying:
<!-- https://micropyramid.com/blog/aggregation-in-django-minumum-and-maximum-values-from-django-model/ -->

### What I did (Instructions for myself)
1. Setup Django and Postgres
  1. Make sure in the python3 env with django installed, then run `django-admin startproject {project-name}`.
  2. `python manage.py startapp backend`
  3. In '{project}/settings.py', under 'INSTALLED_APPS' add the new app we just created. It will be called `backend.apps.BackendConfig`. If we aren't sure what the app is called, we go into the app directory (in this case `backend/`) and into the `apps.py` file. In there, we find:
      ```
      from django.apps import AppConfig


      class BackendConfig(AppConfig):
          name = 'backend'
      ```
      So in `INSTALLED_APPS`, we give the path to the `BackendConfig`
  4. If you're fine with SQLite3, you can run the migrations now, but I want PostgreSQL. For Postgres, make sure you `pip install psycopg2`. For other DBs, check the django docs for the coorrect engine.
    1. There could be another whole article on just setting up the pain in the ass that is PostgreSQL, and I'll probably compile my notes at some point. But after Postgres was working, I created a new user `user01` and a new database `ttsdb`.
    2. Updated my `DATABASES` settings in `settings.py` to the following:
      ```
      DATABASES = {
          'default': {
              'ENGINE': 'django.db.backends.postgresql',
              'NAME': 'ttsdb',
              'USER': 'user01',
              'PASSWORD': 'test1234',
              'HOST': '127.0.0.1', # apparently can also use 'localhost'
              'PORT': '5432', # default is 5432
          }
      }
      ```
    3. Now you're ready to run migrations, as long as you have something to migrate in `models.py`.
      1. Create a model.
      2. Navigate out to top level project folder (where `manage.py` is a sibling), and run the following commands to run the migrations and link your postgres db with Django:
      ```
      python manage.py makemigrations backend
      python manage.py migrate backend
      ```
      3. To make sure it worked, go into postgres `psql postgres`. Switch to the database `ttsdb` (`\c ttsdb`) and show the tables (`\dt`). Should see a table named `backend_ttsentry`.
    4. Next, for my case, I ran a python script to seed the data. For some reason, running the script wouldn't work, so I opened the django shell and ran it manually (`python manage.py shell`). See `upload_data.py` for the code.
2. Webpack and Babel
  * The reason I do this early is because this was a nightmare for me early on, so I want to check and make sure it's working before I build my entire API.
  * Things to know:
    * Webpack just bundles all your js files into a minified bundle file. You can use webpack with just Django if you want to, as shown by https://www.jamesbaltar.com/django-webpack. We don't need a special frontend framework for it. It's just for wiring up a lot of assets into one place, and it can do lots of stuff to make your life easier. So we run Webpack into our django app, as Django will load the base template and load all the assets. We don't load the assets into React.
    * I've seen multiple ways of loading React into Django, and lots of them look messy (such as doing two django apps). When I first learned Ruby on Rails, the whole goal was just to get one static template file, and then have react hook into that. It's in that static page where we also load in our assets, which is really important to know in all languages. This link talks about that: https://www.javascriptstuff.com/react-with-any-backend/. This was another helpful stack overflow post talking about these concepts: https://www.javascriptstuff.com/react-with-any-backend/. That said, the goal here is to create a base tempalte where react hooks in, and then use webpack to wire in the assets THROUGH Django. Let's see how this goes. Thanks to https://web.archive.org/web/20171207032005/http://geezhawk.github.io/using-react-with-django-rest-framework, https://www.jamesbaltar.com/django-webpack, and https://www.techiediaries.com/django-webpack-react/ for good examples of these techniques. Want to give a special shoutout to Jonathan Cox at https://web.archive.org/web/20171207032005/http://geezhawk.github.io/using-react-with-django-rest-framework for his detail on why he did what he did. I will be paraphrasing some of his comments so users can better understand what things do. I think this might be another good oneto read at some point: https://medium.com/labcodes/configuring-django-with-react-4c599d1eae63.
  1. `npm init`
    * if you haven't installed npm, do it
    * This command has npm create a package.json file for you. This file manages your dependencies in node_modules.
  2. `npm install --save-dev webpack webpack-cli  "webpack-bundle-tracker@<1" @babel/core babel-loader @babel/preset-env @babel/preset-react`
    * webpack and webpack bundle tracker
      * As mentioned, webpack bundles all the JSX, JS, React, dependencies, etc. amd compiles that to JS so the browser can understand. It's extremely configurable because we can plugin whichever loaders we need (see all the babel loaders we use). All the details for webpack will get stored in `webpack.config.js`
      * all the babels are different loaders for transpiling JS files (read translating). Takes JSX code and other JS and turns it into simple JS code that any browswer can run. It's a translator.
      * `--save-dev` saves the package in your dev dependencies. Idk what this means yet
      * looking up stuff with webpack dev server, but will probably need a build command later for deployment
  3. `.babelrc`
    `{ "presets": ["@babel/preset-env", "@babel/preset-react"] }`
  3. `mkdir -p assets/js`, `touch assets/js/index.js`
3. React
  1. `npm install --save-dev react react-dom`
  2. Crete react element at `assets/js/index.js`
4. Integrate React with Django
  1. `pip install django-webpack-loader`
  2. updated staticfiles dirs with assets, updatd webpack_laoder settings as is
  3. made template/index.html with the webpack loader stuff
    * make sure to update templates dirs to go to templates in settings
  4. in top level urlconf, inmport template view from django,views.generic, also imoprt path
  5. kept getting this error: 


    // "webpack-bundle-tracker": "^1.0.0-alpha.1",
    needded to downgrade webpack bundle tracker thanks https://github.com/owais/django-webpack-loader/issues/227
  6. Then, I started getting this error: `Not Found: /automain-fe8b6547c4e67f4fe3fe.js`.
    * Apparently, Webpack has a default setting of `publicPath: 'auto'`, so my `webpack-stats.json` file was adding auto to my bundled js file:
    ```
    {"status":"done","publicPath":"auto","chunks":{"main":[{"name":"main-fe8b6547c4e67f4fe3fe.js","publicPath":"automain-fe8b6547c4e67f4fe3fe.js","path":"/Users/lex/Documents/coding/python/hellometer-project/total_tts/assets/bundles/main-fe8b6547c4e67f4fe3fe.js"}]}}
    ```

    * So I had to remove the publicpath in webpack. By adding `publicPath: ''` to my webpack.config.js file, I was able to fix it and it finally loaded react. Victory!!!