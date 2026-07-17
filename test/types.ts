import {env} from '../lib';

const plainStore = env({URL: 'https://example.com', RETRIES: 3});
const plainUrl: string = plainStore.get('URL');
const plainRetries: number = plainStore.get('RETRIES');

const undefinedOptionsStore = env(
	{URL: 'https://example.com', RETRIES: 3},
	undefined
);
const undefinedOptionsUrl: string = undefinedOptionsStore.get('URL');

const forwardedOptions:
	| {validators: {DATABASE: (value: string) => boolean}}
	| undefined = Math.random() > 0.5
	? {validators: {DATABASE: () => false}}
	: undefined;
const forwardedOptionsStore = env({DATABASE: 'user'}, forwardedOptions);
const maybeForwardedDatabase: string | undefined =
	forwardedOptionsStore.get('DATABASE');

void plainUrl;
void plainRetries;
void undefinedOptionsUrl;
void maybeForwardedDatabase;

// @ts-expect-error Forwarded optional validators can reject the value.
const forwardedDatabase: string = forwardedOptionsStore.get('DATABASE');

const guaranteedForwardedOptions:
	| {
		defaults: {DATABASE: string};
		validators: {DATABASE: (value: string) => boolean};
	}
	| undefined = Math.random() > 0.5
	? {
		defaults: {DATABASE: 'fallback'},
		validators: {DATABASE: () => false}
	}
	: undefined;
const guaranteedForwardedStore = env(
	{DATABASE: 'user'},
	guaranteedForwardedOptions
);
const guaranteedForwardedDatabase: string =
	guaranteedForwardedStore.get('DATABASE');

void guaranteedForwardedDatabase;

const store = env(
	{URL: 'https://example.com', RETRIES: 3},
	{
		defaults: {RETRIES: 1},
		validators: {RETRIES: retries => retries > 0}
	}
);

const url: string = store.get('URL');
const retries: number = store.get('RETRIES');

void url;
void retries;

const rejectableStore = env(
	{DATABASE: 'user', URL: 'https://example.com'},
	{validators: {DATABASE: () => false}}
);
const maybeDatabase: string | undefined = rejectableStore.get('DATABASE');
const rejectableUrl: string = rejectableStore.get('URL');

void maybeDatabase;
void rejectableUrl;

// @ts-expect-error A validator-rejected value without a default can be undefined.
const database: string = rejectableStore.get('DATABASE');

const defaultedStore = env(
	{DATABASE: 'user'},
	{
		defaults: {DATABASE: 'fallback'},
		validators: {DATABASE: () => false}
	}
);
const defaultedDatabase: string = defaultedStore.get('DATABASE');

void defaultedDatabase;

const variableValidators: Partial<{
	DATABASE: (value: string) => boolean;
	URL: (value: string) => boolean;
}> = {DATABASE: () => false};
const variableValidatorStore = env(
	{DATABASE: 'user', URL: 'https://example.com'},
	{validators: variableValidators}
);
const maybeVariableDatabase: string | undefined =
	variableValidatorStore.get('DATABASE');
const maybeVariableUrl: string | undefined = variableValidatorStore.get('URL');

void maybeVariableDatabase;
void maybeVariableUrl;

// @ts-expect-error A partial validator map can reject any declared key.
const variableDatabase: string = variableValidatorStore.get('DATABASE');

// @ts-expect-error A partial validator map can reject any declared key.
const variableUrl: string = variableValidatorStore.get('URL');

const optionalDefaultsOptions: {
	defaults?: {DATABASE: string};
	validators: {DATABASE: (value: string) => boolean};
} = {validators: {DATABASE: () => false}};
const optionalDefaultsStore = env(
	{DATABASE: 'user'},
	optionalDefaultsOptions
);
const maybeOptionalDefaultsDatabase: string | undefined =
	optionalDefaultsStore.get('DATABASE');

void maybeOptionalDefaultsDatabase;

// @ts-expect-error An optional outer defaults object is not a guarantee.
const optionalDefaultsDatabase: string =
	optionalDefaultsStore.get('DATABASE');

const undefinedDefaultsOptions: {
	defaults: {DATABASE: string} | undefined;
	validators: {DATABASE: (value: string) => boolean};
} = {
	defaults: undefined,
	validators: {DATABASE: () => false}
};
const undefinedDefaultsStore = env(
	{DATABASE: 'user'},
	undefinedDefaultsOptions
);
const maybeUndefinedDefaultsDatabase: string | undefined =
	undefinedDefaultsStore.get('DATABASE');

void maybeUndefinedDefaultsDatabase;

// @ts-expect-error A possibly undefined defaults object is not a guarantee.
const undefinedDefaultsDatabase: string =
	undefinedDefaultsStore.get('DATABASE');

const unionValidators:
	| {DATABASE: (value: string) => boolean}
	| {URL: (value: string) => boolean} = Math.random() > 0.5
	? {DATABASE: () => false}
	: {URL: () => false};
const unionValidatorStore = env(
	{DATABASE: 'user', URL: 'https://example.com'},
	{validators: unionValidators}
);
const maybeUnionDatabase: string | undefined =
	unionValidatorStore.get('DATABASE');
const maybeUnionUrl: string | undefined = unionValidatorStore.get('URL');

void maybeUnionDatabase;
void maybeUnionUrl;

// @ts-expect-error Either union branch can reject DATABASE.
const unionDatabase: string = unionValidatorStore.get('DATABASE');

// @ts-expect-error Either union branch can reject URL.
const unionUrl: string = unionValidatorStore.get('URL');

interface LegacyConfig {
	DATABASE: string;
	URL: string;
}

const legacyStore = env<LegacyConfig, 'DATABASE'>(
	{DATABASE: 'user', URL: 'https://example.com'}
);
const legacyDatabase: string = legacyStore.get('DATABASE');

const legacyUndefinedOptionsStore = env<LegacyConfig, 'DATABASE'>(
	{DATABASE: 'user', URL: 'https://example.com'},
	undefined
);
const legacyUndefinedOptionsDatabase: string =
	legacyUndefinedOptionsStore.get('DATABASE');

void legacyDatabase;
void legacyUndefinedOptionsDatabase;

// @ts-expect-error Explicit legacy key arguments continue to restrict get().
legacyStore.get('URL');

const legacyDefaultedStore = env<LegacyConfig, 'DATABASE'>(
	{DATABASE: 'user', URL: 'https://example.com'},
	{defaults: {DATABASE: 'fallback'}}
);
const legacyDefaultedDatabase: string =
	legacyDefaultedStore.get('DATABASE');

void legacyDefaultedDatabase;

const legacyGuaranteedStore = env<LegacyConfig, 'DATABASE'>(
	{DATABASE: 'user', URL: 'https://example.com'},
	{
		defaults: {DATABASE: 'fallback'},
		validators: {DATABASE: () => false}
	}
);
const legacyGuaranteedDatabase: string =
	legacyGuaranteedStore.get('DATABASE');

void legacyGuaranteedDatabase;

const legacyValidatedStore = env<LegacyConfig, 'DATABASE'>(
	{DATABASE: 'user', URL: 'https://example.com'},
	{validators: {DATABASE: () => false}}
);
const maybeLegacyValidatedDatabase: string | undefined =
	legacyValidatedStore.get('DATABASE');

void maybeLegacyValidatedDatabase;

// @ts-expect-error Legacy explicit calls with options can still reject a value.
const legacyValidatedDatabase: string =
	legacyValidatedStore.get('DATABASE');

const legacyForwardedOptionsStore = env<LegacyConfig, 'DATABASE'>(
	{DATABASE: 'user', URL: 'https://example.com'},
	forwardedOptions
);
const maybeLegacyForwardedDatabase: string | undefined =
	legacyForwardedOptionsStore.get('DATABASE');

void maybeLegacyForwardedDatabase;

// @ts-expect-error Forwarded legacy validators can reject the value.
const legacyForwardedDatabase: string =
	legacyForwardedOptionsStore.get('DATABASE');

const legacyGuaranteedForwardedStore = env<LegacyConfig, 'DATABASE'>(
	{DATABASE: 'user', URL: 'https://example.com'},
	guaranteedForwardedOptions
);
const legacyGuaranteedForwardedDatabase: string =
	legacyGuaranteedForwardedStore.get('DATABASE');

void legacyGuaranteedForwardedDatabase;

const legacyOptionalValidatorOptions:
	| {
		defaults: {DATABASE: string};
		validators?: {DATABASE: (value: string) => boolean};
	}
	| undefined = Math.random() > 0.5
	? {defaults: {DATABASE: 'fallback'}}
	: undefined;
const legacyOptionalValidatorStore = env<LegacyConfig, 'DATABASE'>(
	{DATABASE: 'user', URL: 'https://example.com'},
	legacyOptionalValidatorOptions
);
const legacyOptionalValidatorDatabase: string =
	legacyOptionalValidatorStore.get('DATABASE');

void legacyOptionalValidatorDatabase;

env(
	{NAME: undefined as string | undefined},
	{validators: {NAME: value => {
		const definedName: string = value;

		return definedName.length > 0;
	}}}
);

// @ts-expect-error Unknown environment keys are rejected.
store.get('MISSING');

env(
	{RETRIES: 3},
	{
		// @ts-expect-error Defaults must use the environment value type.
		defaults: {RETRIES: 'three'}
	}
);

env(
	{URL: 'https://example.com'},
	{
		validators: {
			// @ts-expect-error Validators must use known environment keys.
			MISSING: () => true
		}
	}
);
