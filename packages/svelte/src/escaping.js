const ATTR_REGEX = /[&"<]/g;
const CONTENT_REGEX = /[&<]/g;

/**
 * @template V
 * @param {V} value
 * @param {boolean} [is_attr]
 */
export function escape_html(value, is_attr) {
	/** @type {string} */
	let str;

	if (typeof value === 'string') {
		str = value;
	} else if (value == null) {
		return '';
	} else if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
		// these can never contain `&`, `<` or `"`, so skip the scan.
		// functions are deliberately not in this list: stringifying one yields its source
		return '' + value;
	} else {
		str = String(value);
	}

	// nothing to escape is by far the common case, and a short string is cheaper to walk
	// than to hand to the regex. 13 measured best on a mix of real interpolations
	if (str.length < 13) {
		let i = 0;

		while (i < str.length) {
			const code = str.charCodeAt(i);
			if (code === 38 || code === 60 || (code === 34 && is_attr)) break;
			i += 1;
		}

		if (i === str.length) return str;
	}

	const pattern = is_attr ? ATTR_REGEX : CONTENT_REGEX;
	pattern.lastIndex = 0;

	let escaped = '';
	let last = 0;

	while (pattern.test(str)) {
		const i = pattern.lastIndex - 1;
		const ch = str[i];
		escaped += str.substring(last, i) + (ch === '&' ? '&amp;' : ch === '"' ? '&quot;' : '&lt;');
		last = i + 1;
	}

	return escaped + str.substring(last);
}
