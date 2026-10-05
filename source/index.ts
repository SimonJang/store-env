type Defaults<T> = Partial<{
	[K in keyof T]: T[K];
}>;

type Validators<T> = Partial<{
	[K in keyof T]: (data: Exclude<T[K], undefined>) => boolean | never;
}>;

type KeysOfUnion<T> = T extends unknown ? keyof T : never;

type GuaranteedKeys<T> = {
	[K in KeysOfUnion<T>]: [T] extends [Record<K, infer V>]
		? undefined extends V
			? never
			: K
		: never;
}[KeysOfUnion<T>];

interface Options<T> {
	/**
	 * Default options for missing or undefined values
	 */
	defaults?: Defaults<T>;
	/**
	 * Validation rules for the environment variables
	 */
	validators?: Validators<T>;
}

type OptionProperty<O, K extends PropertyKey> = O extends unknown
	? K extends keyof O
		? NonNullable<O[K]>
		: {}
	: never;

type GuaranteedOptionProperty<O, K extends PropertyKey> = [O] extends [
	Record<K, infer V>
]
	? undefined extends V
		? {}
		: NonNullable<V>
	: {};

type EnvValueForOptions<T, O, K extends keyof T> = K extends KeysOfUnion<
	OptionProperty<O, 'validators'>
>
	? K extends GuaranteedKeys<GuaranteedOptionProperty<O, 'defaults'>>
		? T[K]
		: T[K] | undefined
	: T[K];

type EnvValue<T, O, K extends keyof T> = O extends unknown
	? EnvValueForOptions<T, O, K>
	: never;

interface Env<T, AllowedKeys extends keyof T, O> {
	get<K extends AllowedKeys>(key: K): EnvValue<T, O, K>;
}

const withoutUndefined = <T>(input: T): Partial<T> => {
	const result: Partial<T> = {...input};

	for (const key of Object.keys(result) as Array<keyof T>) {
		if (result[key] === undefined) {
			delete result[key];
		}
	}

	return result;
};

export function env<T, O extends Options<T>>(
	environment: T,
	options: O & Options<T>
): Env<T, keyof T, O>;
export function env<T, K extends keyof T = keyof T>(
	environment: T,
	options?: undefined
): Env<T, K, {}>;
export function env<T, K extends keyof T>(
	environment: T,
	options: {defaults?: Defaults<T>; validators?: undefined}
): Env<T, K, {}>;
export function env<T, K extends keyof T>(
	environment: T,
	options: {
		defaults: Required<Pick<T, K>> & Defaults<T>;
		validators?: Validators<T>;
	} | undefined
): Env<T, K, {}>;
export function env<T, O extends Options<T>>(
	environment: T,
	options: (O & Options<T>) | undefined
): Env<T, keyof T, O | {}>;
export function env<T, K extends keyof T>(
	environment: T,
	options: Options<T> | undefined
): Env<T, K, Options<T>>;
export function env<T>(
	environment: T,
	options: Options<T> = {}
): Env<T, keyof T, Options<T>> {
	let map = {...environment};

	if (options.validators) {
		const validators = {...options.validators} as Validators<T>;

		for (const prop of Object.keys(validators) as Array<keyof T>) {
			const validationFn = validators[prop] as
				| ((data: Exclude<T[keyof T], undefined>) => boolean | never)
				| undefined;

			if (!validationFn) {
				continue;
			}

			const value = map[prop];

			if (value === undefined) {
				delete (map as Partial<T>)[prop];
				continue;
			}

			const isValid = validationFn(
				value as Exclude<T[keyof T], undefined>
			);

			if (isValid) {
				continue;
			}

			delete (map as Partial<T>)[prop];
		}
	}

	if (options.defaults) {
		map = {
			...options.defaults,
			...withoutUndefined(map)
		} as T;
	}

	const readOnlyEnv = (envMap: T): Env<T, keyof T, Options<T>> => {
		return {
			get: <P extends keyof T>(
				key: P
			): EnvValue<T, Options<T>, P> =>
				(Object.prototype.hasOwnProperty.call(envMap, key)
					? envMap[key]
					: undefined) as EnvValue<T, Options<T>, P>
		};
	};

	return readOnlyEnv(map);
}
