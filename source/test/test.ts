import {env} from '..';

beforeAll((): void => {
	process.env.URL = 'https://www.google.com/';
	process.env.DATABASE = 'user';
});

test('should return a private map with environment variables', () => {
	const envs = env(process.env as {URL: string; DATABASE: string});

	expect(envs.get('URL')).toBe('https://www.google.com/');
	expect(envs.get('DATABASE')).toBe('user');
});

test('should use defaults when undefined', () => {
	const envs = env(
		process.env as {URL: string; DATABASE: string; name: string},
		{defaults: {name: 'FooBar'}}
	);

	expect(envs.get('URL')).toBe('https://www.google.com/');
	expect(envs.get('DATABASE')).toBe('user');
	expect(envs.get('name')).toBe('FooBar');
});

test('should use validation', () => {
	const envs = env(
		process.env as {URL: string; DATABASE: string; name: string},
		{
			defaults: {name: 'FooBar'},
			validators: {DATABASE: user => user.length < 3}
		}
	);

	expect(envs.get('URL')).toBe('https://www.google.com/');
	expect(envs.get('DATABASE')).toBe(undefined);
	expect(envs.get('name')).toBe('FooBar');
});

test('should provide fallback for invalid value', () => {
	const envs = env(
		process.env as {URL: string; DATABASE: string; name: string},
		{
			defaults: {name: 'FooBar', DATABASE: 'FOO'},
			validators: {DATABASE: user => user.length < 3}
		}
	);

	expect(envs.get('URL')).toBe('https://www.google.com/');
	expect(envs.get('DATABASE')).toBe('FOO');
	expect(envs.get('name')).toBe('FooBar');
});
