import clean from 'obj-clean';

interface Options<T> {
	/**
	 * Default options for missing or undefined values
	 */
	defaults?: Partial<
		{
			[K in keyof T]: T[K];
		}
	>;
	/**
	 * Validation rules for the environment variables
	 */
	validators?: Partial<
		{
			[K in keyof T]: (data: T[K]) => boolean | never;
		}
	>;
}

interface Env<T, K extends keyof T> {
	get(key: K): T[K];
}

export const env = <T, K extends keyof T>(
	environment: T,
	options: Options<T> = {}
): Env<T, K> => {
	let map = {...environment};

	if (options.validators) {
		const validators = {...options.validators};

		for (const key of Object.keys(validators)) {
			const prop = key as keyof T;
			const validationFn = validators[prop];

			if (!validationFn) {
				continue;
			}

			const isValid = validationFn(map[prop]);

			if (isValid) {
				continue;
			}

			map[key] = undefined;
		}
	}

	if (options.defaults) {
		map = {
			...options.defaults,
			...(clean(map) as T)
		};
	}

	const readOnlyEnv = (envMap: T): Env<T, K> => {
		return {
			get: key => envMap[key]
		};
	};

	return readOnlyEnv(map);
};
