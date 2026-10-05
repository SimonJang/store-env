# store-env [![CI](https://github.com/SimonJang/store-env/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/SimonJang/store-env/actions/workflows/ci.yml)

> Store for environment variables


## Install

```sh
npm install store-env
```


## Usage

```js
const {env} = require('store-env');

process.env.URL = 'https://www.google.com/';
process.env.DATABASE = 'SOME_VERY_LONG_NAME';
process.env.COUNTER = '5';

const envStore = env(
	process.env,
	{
		defaults: {NAME: 'FooBar', DATABASE: 'FOO'},
		validators: {
			DATABASE: user => user.length < 3,
			COUNTER: counter => Number(counter) % 5 !== 0
		}
	}
);

// Available in environment and no validation defined
envStore.get('URL'); // 'https://www.google.com/'

// Failed the validation function but a default `FOO` is provided
envStore.get('DATABASE'); // 'FOO'

// Default `FooBar` is provided
envStore.get('NAME'); // 'FooBar'

// Failed the validation
envStore.get('COUNTER'); // undefined
```


## API

### env(environment, options?)

#### environment

Type: `Object`

Environment object. Its top-level values are copied when the store is created.

#### [options]

Type: `Object`

##### [options.defaults]

Type: `Object`

Default fallbacks for when an environment value is `undefined` or fails validation. Other defined falsy values, including an empty string, are preserved unless a validator rejects them.

##### [options.validators]

Type: `Object`

Functions that return whether an environment value is valid. Rejected values use a configured default or resolve to `undefined`.
