# Anthologies

Bundle links, spin a yarn.

## Requirements

#### Python 3.6.4

Use [pyenv](https://github.com/yyuu/pyenv) to manage versions.

```
brew install pyenv
pyenv install 3.6.4
```

#### [pipenv](https://github.com/pypa/pipenv)

For managing dependencies. **Note:** If you have a raggety Python setup, like you've had the same machine for years and have installed different versions of Python in different ways...yeah...you should use pyenv to get on a new 3.x version and install/use pipenv there.

```
pip install pipenv
```

One thing to note, any management commands must be run via `pipenv`. Doing so
ensures all installed dependencies are available.

## Setup

Clone the project, install Python dependencies

```
git clone <repo-url>
cd anthologies
pipenv install
```

### Running the local server

```
cd src/
pipenv run python manage.py runserver
```
