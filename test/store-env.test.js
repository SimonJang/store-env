'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {env} = require('../lib');

test('stores a snapshot of the environment', () => {
	const environment = {URL: 'https://example.com', DATABASE: 'user'};
	const store = env(environment);
	environment.URL = 'https://changed.example.com';

	assert.equal(store.get('URL'), 'https://example.com');
	assert.equal(store.get('DATABASE'), 'user');
});

test('uses a default for an undefined value', () => {
	const store = env(
		{URL: 'https://example.com', NAME: undefined},
		{defaults: {NAME: 'fallback'}}
	);

	assert.equal(store.get('URL'), 'https://example.com');
	assert.equal(store.get('NAME'), 'fallback');
});

test('does not validate an undefined value before applying its default', () => {
	let validatorCalls = 0;
	const store = env(
		{NAME: undefined},
		{
			defaults: {NAME: 'fallback'},
			validators: {NAME: value => {
				validatorCalls++;
				return value.length > 0;
			}}
		}
	);

	assert.equal(store.get('NAME'), 'fallback');
	assert.equal(validatorCalls, 0);
});

test('preserves defined falsy values when defaults exist', () => {
	const store = env(
		{EMPTY: '', COUNT: 0, ENABLED: false, NULL: null},
		{defaults: {EMPTY: 'fallback', COUNT: 1, ENABLED: true, NULL: 'fallback'}}
	);

	assert.equal(store.get('EMPTY'), '');
	assert.equal(store.get('COUNT'), 0);
	assert.equal(store.get('ENABLED'), false);
	assert.equal(store.get('NULL'), null);
});

test('keeps values accepted by validators', () => {
	const store = env(
		{DATABASE: 'user'},
		{validators: {DATABASE: user => user.length >= 3}}
	);

	assert.equal(store.get('DATABASE'), 'user');
});

test('returns undefined for rejected values without defaults', () => {
	const environment = {DATABASE: 'user'};
	const store = env(
		environment,
		{validators: {DATABASE: user => user.length < 3}}
	);

	assert.equal(store.get('DATABASE'), undefined);
	assert.equal(environment.DATABASE, 'user');
});

test('uses defaults for validator-rejected values', () => {
	const store = env(
		{DATABASE: 'user'},
		{
			defaults: {DATABASE: 'fallback'},
			validators: {DATABASE: user => user.length < 3}
		}
	);

	assert.equal(store.get('DATABASE'), 'fallback');
});

test('propagates validator errors', () => {
	assert.throws(
		() => env(
			{DATABASE: 'user'},
			{validators: {DATABASE: () => {
				throw new Error('invalid configuration');
			}}}
		),
		/invalid configuration/
	);
});

test('does not expose inherited values for rejected prototype-named keys', () => {
	for (const defaults of [undefined, {OTHER: 'fallback'}]) {
		const store = env(
			{toString: 'invalid', constructor: 'invalid'},
			{
				defaults,
				validators: {toString: () => false, constructor: () => false}
			}
		);

		assert.equal(store.get('toString'), undefined);
		assert.equal(store.get('constructor'), undefined);
	}

	const store = env(
		{toString: 'invalid'},
		{defaults: {toString: 'fallback'}, validators: {toString: () => false}}
	);
	assert.equal(store.get('toString'), 'fallback');
});

test('does not validate inherited values for missing prototype-named keys', () => {
	for (const key of ['toString', 'constructor', 'hasOwnProperty', '__proto__']) {
		for (const [defaults, expected] of [
			[undefined, undefined],
			[{OTHER: 'fallback'}, undefined],
			[{[key]: 'fallback'}, 'fallback']
		]) {
			let validatorCalls = 0;
			const store = env({}, {
				defaults,
				validators: {[key]: value => {
					validatorCalls++;
					return value.trim().length > 0;
				}}
			});

			assert.equal(validatorCalls, 0);
			assert.equal(store.get(key), expected);
		}
	}
});

test('validates own values for prototype-named keys', () => {
	for (const key of ['toString', 'constructor', 'hasOwnProperty', '__proto__']) {
		for (const [value, expected] of [['valid', 'valid'], ['', 'fallback']]) {
			let validatorCalls = 0;
			const store = env({[key]: value}, {
				defaults: {[key]: 'fallback'},
				validators: {[key]: candidate => {
					validatorCalls++;
					return candidate.trim().length > 0;
				}}
			});

			assert.equal(validatorCalls, 1);
			assert.equal(store.get(key), expected);
		}
	}
});
