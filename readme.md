# store-env ![CI](https://github.com/SimonJang/store-env/workflows/CI/badge.svg)

> Store for environment variables


## Install

```
$ npm install store-env
```


## Usage

```js
const {env} = require('store-env')

process.env.URL = 'https://www.google.com/';
process.env.DATABASE = 'SOME_VERY_LONG_NAME';
process.env.COUNTER = 5;

const envStore = env(
		process.env, // {URL: string; DATABASE: string; name: string}
		{
			defaults: {NAME: 'FooBar', DATABASE: 'FOO'},
			validators: {DATABASE: user => user.length < 3, COUNTER: counter => counter % 5 !== 0}
		}
	);

// Available in environment and no validation defined
envStore.get('URL') // 'https://www.google.com/'

// Failed the validation function but a default `FOO` is provided
envStore.get('DATABASE') // 'FOO'

// Default `FooBar` is provided
envStore.get('NAME') // 'FooBar'

// Failed the validation
envStore.get('COUNTER') // undefined
```


## API

### envStore(environment, options?)

#### environment

Type: `Object`

Environment object

#### [options]

Type: `Object`

##### [options.defaults]

Type: `Object`

Default fallbacks for when the environment variable is undefined or fails validation

##### [options.validators]

Type: `Object`

Assertion functions, returning a boolean to reflect the validation of the environment variable
